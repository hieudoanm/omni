package cobra

import (
	"fmt"
	"go/ast"
	"go/parser"
	"go/token"
	"io"
	"os"
	"path/filepath"
	"strings"

	"github.com/spf13/cobra"
)

type FlagDoc struct {
	Name         string
	Shorthand    string
	DefaultValue string
	Usage        string
	Persistent   bool
}

type commandDoc struct {
	FullName    string
	Short       string
	Long        string
	Example     string
	Flags       []FlagDoc
	SubCommands []commandDoc
}

type cmdRef struct {
	doc      commandDoc
	varName  string
	funcName string
	localVar string
	filePath string
	children []string
}

func getStringField(lit *ast.CompositeLit, field string) string {
	for _, elt := range lit.Elts {
		kv, ok := elt.(*ast.KeyValueExpr)
		if !ok {
			continue
		}
		key, ok := kv.Key.(*ast.Ident)
		if !ok || key.Name != field {
			continue
		}
		switch v := kv.Value.(type) {
		case *ast.BasicLit:
			return strings.Trim(v.Value, "`\"")
		case *ast.CallExpr:
			if len(v.Args) > 0 {
				if bl, ok := v.Args[0].(*ast.BasicLit); ok {
					return strings.Trim(bl.Value, "`\"")
				}
			}
		}
	}
	return ""
}

func extractCmd(lit *ast.CompositeLit) commandDoc {
	return commandDoc{
		FullName: getStringField(lit, "Use"),
		Short:    getStringField(lit, "Short"),
		Long:     getStringField(lit, "Long"),
		Example:  getStringField(lit, "Example"),
	}
}

func funcHasCmdReturn(fn *ast.FuncDecl) bool {
	if fn.Type.Results == nil || len(fn.Type.Results.List) != 1 {
		return false
	}
	sel, ok := fn.Type.Results.List[0].Type.(*ast.StarExpr)
	if !ok {
		return false
	}
	px, ok := sel.X.(*ast.SelectorExpr)
	if !ok {
		return false
	}
	return px.Sel.Name == "Command"
}

func identName(e ast.Expr) string {
	switch v := e.(type) {
	case *ast.Ident:
		return v.Name
	case *ast.CallExpr:
		return identName(v.Fun)
	case *ast.SelectorExpr:
		return v.Sel.Name
	}
	return ""
}

func qualifiedIdentName(e ast.Expr) string {
	switch v := e.(type) {
	case *ast.Ident:
		return v.Name
	case *ast.CallExpr:
		return qualifiedIdentName(v.Fun)
	case *ast.SelectorExpr:
		if pkg, ok := v.X.(*ast.Ident); ok {
			return pkg.Name + "." + v.Sel.Name
		}
		return v.Sel.Name
	}
	return ""
}

func basicLitString(e ast.Expr) string {
	switch v := e.(type) {
	case *ast.BasicLit:
		return strings.Trim(v.Value, "`\"")
	case *ast.Ident:
		return v.Name
	}
	return ""
}

func extractFlag(method string, args []ast.Expr) *FlagDoc {
	nameIdx, shorthandIdx, defaultIdx, usageIdx := -1, -1, -1, -1
	var hasShorthand bool

	switch method {
	case "StringP", "IntP", "BoolP", "Float64P", "DurationP",
		"Int32P", "Int64P", "Uint32P", "Uint64P",
		"StringSliceP", "IntSliceP", "Int32SliceP", "Int64SliceP",
		"UintSliceP", "BoolSliceP", "Float32SliceP", "DurationSliceP":
		nameIdx, shorthandIdx, defaultIdx, usageIdx = 0, 1, 2, 3
		hasShorthand = true
	case "String", "Int", "Bool", "Float64", "Duration",
		"Int32", "Int64", "Uint32", "Uint64",
		"StringSlice", "IntSlice", "BoolSlice":
		nameIdx, defaultIdx, usageIdx = 0, 1, 2
	case "StringToString", "StringToStringP":
		nameIdx, defaultIdx, usageIdx = 0, 1, 2
		hasShorthand = strings.HasSuffix(method, "P")
		if hasShorthand {
			shorthandIdx = 1
			defaultIdx = 2
			usageIdx = 3
		}
	case "StringVarP", "IntVarP", "BoolVarP", "Float64VarP", "DurationVarP",
		"Int32VarP", "Int64VarP", "Uint32VarP", "Uint64VarP":
		nameIdx, shorthandIdx, defaultIdx, usageIdx = 1, 2, 3, 4
		hasShorthand = true
	case "StringVar", "IntVar", "BoolVar", "Float64Var", "DurationVar":
		nameIdx, defaultIdx, usageIdx = 1, 2, 3
	}

	if nameIdx < 0 || nameIdx >= len(args) {
		return nil
	}

	doc := &FlagDoc{
		Name:  basicLitString(args[nameIdx]),
		Usage: basicLitString(args[usageIdx]),
	}
	if hasShorthand && shorthandIdx >= 0 && shorthandIdx < len(args) {
		doc.Shorthand = basicLitString(args[shorthandIdx])
	}
	if defaultIdx >= 0 && defaultIdx < len(args) {
		doc.DefaultValue = basicLitString(args[defaultIdx])
	}
	if doc.Name == "" {
		return nil
	}
	return doc
}

func findFlagsForCmd(root ast.Node, varName string) []FlagDoc {
	var flags []FlagDoc
	seen := map[string]bool{}

	ast.Inspect(root, func(n ast.Node) bool {
		call, ok := n.(*ast.CallExpr)
		if !ok {
			return true
		}
		sel, ok := call.Fun.(*ast.SelectorExpr)
		if !ok {
			return true
		}
		innerCall, ok := sel.X.(*ast.CallExpr)
		if !ok {
			return true
		}
		innerSel, ok := innerCall.Fun.(*ast.SelectorExpr)
		if !ok {
			return true
		}
		xIdent, ok := innerSel.X.(*ast.Ident)
		if !ok || xIdent.Name != varName {
			return true
		}
		if innerSel.Sel.Name != "Flags" && innerSel.Sel.Name != "PersistentFlags" {
			return true
		}

		methodName := sel.Sel.Name
		flag := extractFlag(methodName, call.Args)
		if flag == nil {
			return true
		}
		flag.Persistent = innerSel.Sel.Name == "PersistentFlags"

		key := flag.Name
		if flag.Shorthand != "" {
			key += "-" + flag.Shorthand
		}
		if !seen[key] {
			seen[key] = true
			flags = append(flags, *flag)
		}
		return true
	})

	return flags
}

func findCmds(dir string) (map[string]*cmdRef, map[string]string, error) {
	refs := map[string]*cmdRef{}
	funcToVar := map[string]string{}
	skipNames := map[string]bool{"completion": true, "help": true, "docs": true}

	err := filepath.Walk(dir, func(path string, fi os.FileInfo, err error) error {
		if err != nil || fi.IsDir() || !strings.HasSuffix(path, ".go") {
			return nil
		}

		fset := token.NewFileSet()
		f, err := parser.ParseFile(fset, path, nil, parser.ParseComments)
		if err != nil {
			return nil
		}
		pkgName := f.Name.Name

		ast.Inspect(f, func(n ast.Node) bool {
			switch node := n.(type) {

			case *ast.GenDecl:
				for _, spec := range node.Specs {
					vs, ok := spec.(*ast.ValueSpec)
					if !ok {
						continue
					}
					for i, val := range vs.Values {
						unary, ok := val.(*ast.UnaryExpr)
						if !ok {
							continue
						}
						lit, ok := unary.X.(*ast.CompositeLit)
						if !ok {
							continue
						}
						sel, ok := lit.Type.(*ast.SelectorExpr)
						if !ok || sel.Sel.Name != "Command" {
							continue
						}
						name := strings.Fields(getStringField(lit, "Use"))[0]
						if name == "" || skipNames[name] {
							continue
						}
						vn := vs.Names[i].Name
						ref := &cmdRef{
							doc:      extractCmd(lit),
							varName:  vn,
							filePath: path,
						}
						ref.doc.Flags = findFlagsForCmd(f, vn)
						refs[vn] = ref
					}
				}

			case *ast.FuncDecl:
				if !funcHasCmdReturn(node) {
					break
				}
				var found bool
				ast.Inspect(node.Body, func(n ast.Node) bool {
					stmt, ok := n.(*ast.AssignStmt)
					if !ok || len(stmt.Lhs) != 1 || len(stmt.Rhs) != 1 {
						return true
					}
					unary, ok := stmt.Rhs[0].(*ast.UnaryExpr)
					if !ok {
						return true
					}
					lit, ok := unary.X.(*ast.CompositeLit)
					if !ok {
						return true
					}
					sel, ok := lit.Type.(*ast.SelectorExpr)
					if !ok || sel.Sel.Name != "Command" {
						return true
					}
					name := strings.Fields(getStringField(lit, "Use"))[0]
					if name == "" || skipNames[name] {
						return true
					}
					fnName := node.Name.Name
					qualifiedName := pkgName + "." + fnName
					localVarName := identName(stmt.Lhs[0])
					ref := &cmdRef{
						doc:      extractCmd(lit),
						funcName: fnName,
						localVar: localVarName,
						filePath: path,
					}
					ref.doc.Flags = findFlagsForCmd(node.Body, localVarName)
					refs[qualifiedName] = ref
					found = true
					return false
				})
				if found {
					break
				}
				ast.Inspect(node.Body, func(n ast.Node) bool {
					ret, ok := n.(*ast.ReturnStmt)
					if !ok || len(ret.Results) != 1 {
						return true
					}
					unary, ok := ret.Results[0].(*ast.UnaryExpr)
					if !ok {
						return true
					}
					lit, ok := unary.X.(*ast.CompositeLit)
					if !ok {
						return true
					}
					sel, ok := lit.Type.(*ast.SelectorExpr)
					if !ok || sel.Sel.Name != "Command" {
						return true
					}
					name := strings.Fields(getStringField(lit, "Use"))[0]
					if name == "" || skipNames[name] {
						return true
					}
					fnName := node.Name.Name
					qualifiedName := pkgName + "." + fnName
					refs[qualifiedName] = &cmdRef{
						doc:      extractCmd(lit),
						funcName: fnName,
						filePath: path,
					}
					return false
				})
				if found {
					break
				}
				ast.Inspect(node.Body, func(n ast.Node) bool {
					ret, ok := n.(*ast.ReturnStmt)
					if !ok || len(ret.Results) != 1 {
						return true
					}
					ident, ok := ret.Results[0].(*ast.Ident)
					if !ok {
						return true
					}
					varName := ident.Name
					if _, ok := refs[varName]; ok {
						fnName := pkgName + "." + node.Name.Name
						funcToVar[fnName] = varName
						found = true
					}
					return false
				})
			}
			return true
		})
		return nil
	})

	if err != nil {
		return nil, nil, fmt.Errorf("walk %s: %w", dir, err)
	}
	return refs, funcToVar, nil
}

func findAddCalls(dir string, refs map[string]*cmdRef, funcToVar map[string]string) {
	filepath.Walk(dir, func(path string, fi os.FileInfo, err error) error {
		if err != nil || fi.IsDir() || !strings.HasSuffix(path, ".go") {
			return nil
		}

		fset := token.NewFileSet()
		f, err := parser.ParseFile(fset, path, nil, parser.ParseComments)
		if err != nil {
			return nil
		}
		pkgName := f.Name.Name

		ast.Inspect(f, func(n ast.Node) bool {
			fn, ok := n.(*ast.FuncDecl)
			if !ok || fn.Body == nil {
				return true
			}

			ast.Inspect(fn.Body, func(n ast.Node) bool {
				stmt, ok := n.(*ast.ExprStmt)
				if !ok {
					return true
				}
				call, ok := stmt.X.(*ast.CallExpr)
				if !ok {
					return true
				}
				sel, ok := call.Fun.(*ast.SelectorExpr)
				if !ok || sel.Sel.Name != "AddCommand" {
					return true
				}

				parentName := identName(sel.X)
				parent, ok := refs[parentName]
				if !ok {
					qualifiedName := pkgName + "." + fn.Name.Name
					if ref, exists := refs[qualifiedName]; exists && ref.localVar == parentName {
						parent = ref
						ok = true
					}
				}
				if !ok {
					return true
				}

				for _, arg := range call.Args {
					childName := qualifiedIdentName(arg)
					if _, exists := refs[childName]; !exists {
						pkgQualified := pkgName + "." + childName
						if _, exists := refs[pkgQualified]; exists {
							childName = pkgQualified
						} else if target, ok := funcToVar[pkgQualified]; ok {
							childName = target
						}
					}
					if _, exists := refs[childName]; exists {
						parent.children = append(parent.children, childName)
					}
				}
				return true
			})
			return true
		})
		return nil
	})
}

func buildTree(refs map[string]*cmdRef) []commandDoc {
	childSet := map[string]bool{}
	for _, ref := range refs {
		for _, c := range ref.children {
			childSet[c] = true
		}
	}

	var roots []commandDoc
	for name := range refs {
		if childSet[name] {
			continue
		}
		roots = append(roots, wireTree(name, refs, map[string]bool{}))
	}
	return roots
}

func wireTree(name string, refs map[string]*cmdRef, visited map[string]bool) commandDoc {
	if visited[name] {
		return commandDoc{}
	}
	visited[name] = true

	ref := refs[name]
	if ref == nil {
		return commandDoc{}
	}

	doc := ref.doc
	for _, c := range ref.children {
		child := wireTree(c, refs, visited)
		if child.FullName != "" {
			doc.SubCommands = append(doc.SubCommands, child)
		}
	}
	return doc
}

func renderTOC(w io.Writer, doc commandDoc, rootName string, flagCount *int) {
	fmt.Fprintf(w, "- [`%s`](#%s)\n", rootName, rootName)
	fmt.Fprintf(w, "  - [Table of Contents](#table-of-contents)\n")

	for _, sub := range doc.SubCommands {
		renderTOCEntry(w, sub, rootName, "  ", flagCount)
	}
}

func renderTOCEntry(w io.Writer, doc commandDoc, parentName, indent string, flagCount *int) {
	baseName := strings.Fields(doc.FullName)[0]
	headingText := parentName + " " + baseName
	anchor := strings.ReplaceAll(strings.ToLower(headingText), " ", "-")

	fmt.Fprintf(w, "%s- [`%s`](#%s)\n", indent, headingText, anchor)

	if len(doc.Flags) > 0 {
		if *flagCount == 0 {
			fmt.Fprintf(w, "%s  - [Flags](#flags)\n", indent)
		} else {
			fmt.Fprintf(w, "%s  - [Flags](#flags-%d)\n", indent, *flagCount)
		}
		*flagCount++
	}

	for _, sub := range doc.SubCommands {
		renderTOCEntry(w, sub, headingText, indent+"  ", flagCount)
	}
}

func renderFlags(w io.Writer, flags []FlagDoc, level int) {
	if len(flags) == 0 {
		return
	}

	heading := strings.Repeat("#", level+1)
	fmt.Fprintf(w, "%s Flags\n\n", heading)
	fmt.Fprintf(w, "| Flag | Shorthand | Default | Description |\n")
	fmt.Fprintf(w, "|------|-----------|---------|-------------|\n")
	for _, f := range flags {
		var shorthand string
		if f.Shorthand != "" {
			shorthand = "-" + f.Shorthand
		}
		flagName := "--" + f.Name
		if f.Persistent {
			flagName += " (persistent)"
		}
		fmt.Fprintf(w, "| `%s` | `%s` | `%s` | %s |\n", flagName, shorthand, f.DefaultValue, f.Usage)
	}
	fmt.Fprintf(w, "\n")
}

func renderCommand(doc commandDoc, level int, parentName string, w io.Writer) {
	baseName := strings.Fields(doc.FullName)[0]
	fullUsage := parentName + " " + baseName
	useParts := strings.Fields(doc.FullName)
	if len(useParts) > 1 {
		fullUsage += " " + strings.Join(useParts[1:], " ")
	}
	fullUsage = strings.TrimSpace(fullUsage)

	heading := strings.Repeat("#", level)
	headingText := parentName + " " + baseName
	fmt.Fprintf(w, "%s `%s`\n\n", heading, headingText)
	if doc.Short != "" {
		fmt.Fprintf(w, "%s\n\n", doc.Short)
	}
	if doc.Long != "" {
		fmt.Fprintf(w, "%s\n\n", strings.TrimSpace(doc.Long))
	}
	fmt.Fprintf(w, "```bash\n%s\n```\n\n", fullUsage)
	renderFlags(w, doc.Flags, level)
	if doc.Example != "" {
		fmt.Fprintf(w, "Example:\n\n```bash\n%s\n```\n\n", doc.Example)
	}
	fmt.Fprintf(w, "---\n\n")
	for _, sub := range doc.SubCommands {
		renderCommand(sub, level+1, fullUsage, w)
	}
}

func generateDocs(projectPath string, w io.Writer) error {
	refs, funcToVar, err := findCmds(projectPath)
	if err != nil {
		return err
	}

	findAddCalls(projectPath, refs, funcToVar)

	roots := buildTree(refs)
	if len(roots) == 0 {
		return fmt.Errorf("no cobra commands found in %s", projectPath)
	}

	root := roots[0]
	rootName := strings.Fields(root.FullName)[0]

	fmt.Fprintf(w, "# `%s`\n\n", rootName)
	if root.Short != "" {
		fmt.Fprintf(w, "%s\n\n", root.Short)
	}
	if root.Long != "" && root.Long != root.Short {
		fmt.Fprintf(w, "%s\n\n", strings.TrimSpace(root.Long))
	}
	renderFlags(w, root.Flags, 1)
	fmt.Fprintf(w, "---\n\n")

	if len(root.SubCommands) > 0 {
		var flagCount int
		fmt.Fprintf(w, "## Table of Contents\n\n")
		renderTOC(w, root, rootName, &flagCount)
		fmt.Fprintf(w, "\n")
	}

	for _, sub := range root.SubCommands {
		renderCommand(sub, 2, rootName, w)
	}

	return nil
}

func runCobraDoc(file string, cmd *cobra.Command) error {
	projectPath := file
	if projectPath == "" {
		projectPath = "."
	}
	output, _ := cmd.Flags().GetString("output")

	out, err := os.Create(output)
	if err != nil {
		return err
	}
	defer out.Close()

	if err := generateDocs(projectPath, out); err != nil {
		return err
	}

	fmt.Printf("Docs written to %s\n", output)
	return nil
}
