package cobra

import (
	"bytes"
	"go/ast"
	"go/parser"
	"go/token"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func parseCmdLit(t *testing.T, src string) *ast.CompositeLit {
	t.Helper()
	fset := token.NewFileSet()
	f, err := parser.ParseFile(fset, "test.go", src, parser.ParseComments)
	if err != nil {
		t.Fatal(err)
	}

	var lit *ast.CompositeLit
	ast.Inspect(f, func(n ast.Node) bool {
		if cl, ok := n.(*ast.CompositeLit); ok {
			lit = cl
			return false
		}
		return true
	})

	if lit == nil {
		t.Fatal("no CompositeLit found in source")
	}
	return lit
}

func TestGetStringField(t *testing.T) {
	src := `package p
var cmd = &cobra.Command{
	Use: "hello",
	Short: "A short description",
	Long: "A long description",
	Example: "hello world",
}`
	lit := parseCmdLit(t, src)

	tests := []struct {
		field    string
		expected string
	}{
		{"Use", "hello"},
		{"Short", "A short description"},
		{"Long", "A long description"},
		{"Example", "hello world"},
		{"NonExistent", ""},
	}
	for _, tc := range tests {
		got := getStringField(lit, tc.field)
		if got != tc.expected {
			t.Errorf("getStringField(lit, %q) = %q, want %q", tc.field, got, tc.expected)
		}
	}
}

func TestGetStringField_missingField(t *testing.T) {
	src := `package p
var cmd = &cobra.Command{
	Use: "hello",
}`
	lit := parseCmdLit(t, src)
	got := getStringField(lit, "Missing")
	if got != "" {
		t.Errorf("expected empty string for missing field, got %q", got)
	}
}

func TestGetStringField_backtickString(t *testing.T) {
	src := "package p\nvar cmd = &cobra.Command{\n\tUse: `hello-world`,\n}"
	lit := parseCmdLit(t, src)
	got := getStringField(lit, "Use")
	if got != "hello-world" {
		t.Errorf("expected %q, got %q", "hello-world", got)
	}
}

func TestExtractCmd(t *testing.T) {
	src := `package p
var cmd = &cobra.Command{
	Use: "test-cmd",
	Short: "short",
	Long: "longer description",
	Example: "test-cmd --flag value",
}`
	lit := parseCmdLit(t, src)
	doc := extractCmd(lit)

	if doc.FullName != "test-cmd" {
		t.Errorf("FullName = %q, want %q", doc.FullName, "test-cmd")
	}
	if doc.Short != "short" {
		t.Errorf("Short = %q, want %q", doc.Short, "short")
	}
	if doc.Long != "longer description" {
		t.Errorf("Long = %q, want %q", doc.Long, "longer description")
	}
	if doc.Example != "test-cmd --flag value" {
		t.Errorf("Example = %q, want %q", doc.Example, "test-cmd --flag value")
	}
}

func TestGetStringField_nonStringValue(t *testing.T) {
	src := `package p
var cmd = &cobra.Command{
	Use: "app",
	Args: cobra.ExactArgs(1),
}`
	lit := parseCmdLit(t, src)
	got := getStringField(lit, "Args")
	if got != "1" {
		t.Errorf("expected %q, got %q", "1", got)
	}
}

func TestGetStringField_funcCallValue(t *testing.T) {
	src := `package p
var cmd = &cobra.Command{
	Use: "app",
	Short: fmt.Sprintf("hello %s", "world"),
}`
	lit := parseCmdLit(t, src)
	got := getStringField(lit, "Short")
	if got != "hello %s" {
		t.Errorf("expected %q, got %q", "hello %s", got)
	}
}

func parseFuncDecl(t *testing.T, src string) *ast.FuncDecl {
	t.Helper()
	fset := token.NewFileSet()
	f, err := parser.ParseFile(fset, "test.go", src, parser.ParseComments)
	if err != nil {
		t.Fatal(err)
	}
	for _, decl := range f.Decls {
		if fn, ok := decl.(*ast.FuncDecl); ok {
			return fn
		}
	}
	t.Fatal("no FuncDecl found")
	return nil
}

func TestFuncHasCmdReturn(t *testing.T) {
	tests := []struct {
		name string
		src  string
		want bool
	}{
		{"returns *cobra.Command", `package p; func NewCmd() *cobra.Command { return nil }`, true},
		{"with params", `package p; func NewCmd(a int) *cobra.Command { return nil }`, true},
		{"returns string", `package p; func F() string { return "" }`, false},
		{"returns error", `package p; func F() error { return nil }`, false},
		{"no return", `package p; func F() {}`, false},
		{"multiple returns", `package p; func F() (*cobra.Command, error) { return nil, nil }`, false},
		{"nil results", `package p; func F()`, false},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			fn := parseFuncDecl(t, tc.src)
			got := funcHasCmdReturn(fn)
			if got != tc.want {
				t.Errorf("funcHasCmdReturn = %v, want %v", got, tc.want)
			}
		})
	}
}

func TestIdentName(t *testing.T) {
	tests := []struct {
		name string
		expr ast.Expr
		want string
	}{
		{"plain ident", &ast.Ident{Name: "cmd"}, "cmd"},
		{"call expr", &ast.CallExpr{Fun: &ast.Ident{Name: "newCmd"}}, "newCmd"},
		{"selector expr", &ast.SelectorExpr{X: &ast.Ident{Name: "cmd"}, Sel: &ast.Ident{Name: "AddCommand"}}, "AddCommand"},
		{"call on selector", &ast.CallExpr{Fun: &ast.SelectorExpr{X: &ast.Ident{Name: "cmd"}, Sel: &ast.Ident{Name: "Run"}}}, "Run"},
		{"basic lit returns empty", &ast.BasicLit{Kind: token.STRING, Value: `"x"`}, ""},
		{"empty ident", &ast.Ident{Name: ""}, ""},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			got := identName(tc.expr)
			if got != tc.want {
				t.Errorf("identName = %q, want %q", got, tc.want)
			}
		})
	}
}

func TestQualifiedIdentName(t *testing.T) {
	tests := []struct {
		name string
		expr ast.Expr
		want string
	}{
		{"plain ident", &ast.Ident{Name: "cmd"}, "cmd"},
		{"call expr", &ast.CallExpr{Fun: &ast.Ident{Name: "newCmd"}}, "newCmd"},
		{"pkg.Func selector", &ast.SelectorExpr{X: &ast.Ident{Name: "pkg"}, Sel: &ast.Ident{Name: "Func"}}, "pkg.Func"},
		{"nested call selector", &ast.SelectorExpr{X: &ast.CallExpr{Fun: &ast.Ident{Name: "cmd"}}, Sel: &ast.Ident{Name: "Method"}}, "Method"},
		{"basic lit", &ast.BasicLit{Kind: token.STRING, Value: `"x"`}, ""},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			got := qualifiedIdentName(tc.expr)
			if got != tc.want {
				t.Errorf("qualifiedIdentName = %q, want %q", got, tc.want)
			}
		})
	}
}

func TestBasicLitString(t *testing.T) {
	tests := []struct {
		name string
		expr ast.Expr
		want string
	}{
		{"double quoted", &ast.BasicLit{Kind: token.STRING, Value: `"hello"`}, "hello"},
		{"backtick quoted", &ast.BasicLit{Kind: token.STRING, Value: "`hello`"}, "hello"},
		{"ident", &ast.Ident{Name: "varName"}, "varName"},
		{"int lit", &ast.BasicLit{Kind: token.INT, Value: "42"}, "42"},
		{"call expr", &ast.CallExpr{}, ""},
		{"empty string", &ast.BasicLit{Kind: token.STRING, Value: `""`}, ""},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			got := basicLitString(tc.expr)
			if got != tc.want {
				t.Errorf("basicLitString = %q, want %q", got, tc.want)
			}
		})
	}
}

func strLit(s string) *ast.BasicLit {
	return &ast.BasicLit{Kind: token.STRING, Value: `"` + s + `"`}
}

func TestExtractFlag(t *testing.T) {
	tests := []struct {
		name   string
		method string
		args   []ast.Expr
		want   *FlagDoc
	}{
		{
			name:   "StringP full",
			method: "StringP",
			args:   []ast.Expr{strLit("name"), strLit("n"), strLit("default"), strLit("usage")},
			want:   &FlagDoc{Name: "name", Shorthand: "n", DefaultValue: "default", Usage: "usage"},
		},
		{
			name:   "String no shorthand",
			method: "String",
			args:   []ast.Expr{strLit("name"), strLit("default"), strLit("usage")},
			want:   &FlagDoc{Name: "name", DefaultValue: "default", Usage: "usage"},
		},
		{
			name:   "BoolP",
			method: "BoolP",
			args:   []ast.Expr{strLit("verbose"), strLit("v"), strLit("false"), strLit("enable verbose")},
			want:   &FlagDoc{Name: "verbose", Shorthand: "v", DefaultValue: "false", Usage: "enable verbose"},
		},
		{
			name:   "Int",
			method: "Int",
			args:   []ast.Expr{strLit("count"), strLit("0"), strLit("count value")},
			want:   &FlagDoc{Name: "count", DefaultValue: "0", Usage: "count value"},
		},
		{
			name:   "IntP",
			method: "IntP",
			args:   []ast.Expr{strLit("port"), strLit("p"), strLit("8080"), strLit("port number")},
			want:   &FlagDoc{Name: "port", Shorthand: "p", DefaultValue: "8080", Usage: "port number"},
		},
		{
			name:   "Duration",
			method: "Duration",
			args:   []ast.Expr{strLit("timeout"), strLit("5s"), strLit("timeout duration")},
			want:   &FlagDoc{Name: "timeout", DefaultValue: "5s", Usage: "timeout duration"},
		},
		{
			name:   "DurationP",
			method: "DurationP",
			args:   []ast.Expr{strLit("timeout"), strLit("t"), strLit("5s"), strLit("timeout duration")},
			want:   &FlagDoc{Name: "timeout", Shorthand: "t", DefaultValue: "5s", Usage: "timeout duration"},
		},
		{
			name:   "StringVar",
			method: "StringVar",
			args:   []ast.Expr{&ast.Ident{Name: "&var"}, strLit("name"), strLit("default"), strLit("usage")},
			want:   &FlagDoc{Name: "name", DefaultValue: "default", Usage: "usage"},
		},
		{
			name:   "StringVarP",
			method: "StringVarP",
			args:   []ast.Expr{&ast.Ident{Name: "&var"}, strLit("name"), strLit("n"), strLit("default"), strLit("usage")},
			want:   &FlagDoc{Name: "name", Shorthand: "n", DefaultValue: "default", Usage: "usage"},
		},
		{
			name:   "StringToString",
			method: "StringToString",
			args:   []ast.Expr{strLit("opts"), strLit(""), strLit("options map")},
			want:   &FlagDoc{Name: "opts", DefaultValue: "", Usage: "options map"},
		},
		{
			name:   "StringToStringP",
			method: "StringToStringP",
			args:   []ast.Expr{strLit("opts"), strLit("o"), strLit(""), strLit("options map")},
			want:   &FlagDoc{Name: "opts", Shorthand: "o", DefaultValue: "", Usage: "options map"},
		},
		{
			name:   "BoolSlice",
			method: "BoolSlice",
			args:   []ast.Expr{strLit("flags"), strLit("[]"), strLit("bool flags")},
			want:   &FlagDoc{Name: "flags", DefaultValue: "[]", Usage: "bool flags"},
		},
		{
			name:   "unknown method",
			method: "Unknown",
			args:   nil,
			want:   nil,
		},
		{
			name:   "empty name returns nil",
			method: "String",
			args:   []ast.Expr{strLit(""), strLit("default"), strLit("usage")},
			want:   nil,
		},
		{
			name:   "not enough args",
			method: "StringP",
			args:   nil,
			want:   nil,
		},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			got := extractFlag(tc.method, tc.args)
			if tc.want == nil {
				if got != nil {
					t.Errorf("extractFlag = %+v, want nil", got)
				}
				return
			}
			if got == nil {
				t.Fatal("extractFlag returned nil, want non-nil")
			}
			if got.Name != tc.want.Name || got.Shorthand != tc.want.Shorthand ||
				got.DefaultValue != tc.want.DefaultValue || got.Usage != tc.want.Usage {
				t.Errorf("extractFlag = %+v, want %+v", got, tc.want)
			}
		})
	}
}

func parseFileNode(t *testing.T, src string) *ast.File {
	t.Helper()
	fset := token.NewFileSet()
	f, err := parser.ParseFile(fset, "test.go", src, parser.ParseComments)
	if err != nil {
		t.Fatal(err)
	}
	return f
}

func TestFindFlagsForCmd(t *testing.T) {
	tests := []struct {
		name    string
		src     string
		varName string
		want    []FlagDoc
	}{
		{
			name: "no flags",
			src: `package main
var cmd = &cobra.Command{Use: "app"}`,
			varName: "cmd",
		},
		{
			name: "StringP flag",
			src: `package main
func init() {
	cmd.Flags().StringP("name", "n", "default", "Name usage")
}`,
			varName: "cmd",
			want:    []FlagDoc{{Name: "name", Shorthand: "n", DefaultValue: "default", Usage: "Name usage"}},
		},
		{
			name: "multiple flags",
			src: `package main
func init() {
	cmd.Flags().StringP("name", "n", "", "Name")
	cmd.Flags().BoolP("verbose", "v", false, "Verbose")
	cmd.Flags().Int("count", 0, "Count")
}`,
			varName: "cmd",
			want: []FlagDoc{
				{Name: "name", Shorthand: "n", DefaultValue: "", Usage: "Name"},
				{Name: "verbose", Shorthand: "v", DefaultValue: "false", Usage: "Verbose"},
				{Name: "count", DefaultValue: "0", Usage: "Count"},
			},
		},
		{
			name: "PersistentFlags",
			src: `package main
func init() {
	cmd.PersistentFlags().String("output", "stdout", "Output path")
}`,
			varName: "cmd",
			want:    []FlagDoc{{Name: "output", DefaultValue: "stdout", Usage: "Output path", Persistent: true}},
		},
		{
			name: "mixed flags and persistent",
			src: `package main
func init() {
	cmd.Flags().StringP("name", "n", "", "Name")
	cmd.PersistentFlags().Bool("verbose", false, "Verbose")
}`,
			varName: "cmd",
			want: []FlagDoc{
				{Name: "name", Shorthand: "n", DefaultValue: "", Usage: "Name"},
				{Name: "verbose", DefaultValue: "false", Usage: "Verbose", Persistent: true},
			},
		},
		{
			name: "StringVarP flag",
			src: `package main
func init() {
	cmd.Flags().StringVarP(&val, "name", "n", "default", "usage")
}`,
			varName: "cmd",
			want:    []FlagDoc{{Name: "name", Shorthand: "n", DefaultValue: "default", Usage: "usage"}},
		},
		{
			name: "StringToString flag",
			src: `package main
func init() {
	cmd.Flags().StringToString("opts", "", "options map")
}`,
			varName: "cmd",
			want:    []FlagDoc{{Name: "opts", DefaultValue: "", Usage: "options map"}},
		},
		{
			name: "dedup same flag",
			src: `package main
func init() {
	cmd.Flags().StringP("name", "n", "", "first")
	cmd.Flags().StringP("name", "n", "", "second")
}`,
			varName: "cmd",
			want:    []FlagDoc{{Name: "name", Shorthand: "n", DefaultValue: "", Usage: "first"}},
		},
		{
			name: "wrong var name returns empty",
			src: `package main
func init() {
	cmd.Flags().StringP("name", "n", "", "usage")
}`,
			varName: "other",
			want:    nil,
		},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			f := parseFileNode(t, tc.src)
			got := findFlagsForCmd(f, tc.varName)
			if len(got) != len(tc.want) {
				t.Fatalf("got %d flags, want %d", len(got), len(tc.want))
			}
			for i, w := range tc.want {
				if got[i].Name != w.Name || got[i].Shorthand != w.Shorthand ||
					got[i].DefaultValue != w.DefaultValue || got[i].Usage != w.Usage ||
					got[i].Persistent != w.Persistent {
					t.Errorf("flag %d: got %+v, want %+v", i, got[i], w)
				}
			}
		})
	}
}

func TestFindCmds(t *testing.T) {
	dir := t.TempDir()
	src := `package main
import "github.com/spf13/cobra"
var rootCmd = &cobra.Command{
	Use:   "app",
	Short: "Test app",
	Long:  "A longer description",
}
var subCmd = &cobra.Command{
	Use:   "sub",
	Short: "Subcommand",
}
func newFactoryCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "factory",
		Short: "Factory command",
	}
	cmd.Flags().StringP("flag1", "f", "", "a flag")
	return cmd
}
func newDirectCmd() *cobra.Command {
	return &cobra.Command{
		Use:   "direct",
		Short: "Direct command",
	}
}
func init() {
	rootCmd.Flags().BoolP("verbose", "v", false, "verbose")
	rootCmd.PersistentFlags().String("output", "stdout", "output")
}
`
	if err := os.WriteFile(filepath.Join(dir, "main.go"), []byte(src), 0644); err != nil {
		t.Fatal(err)
	}

	refs, funcToVar, err := findCmds(dir)
	if err != nil {
		t.Fatal(err)
	}

	if len(refs) < 2 {
		t.Fatalf("expected at least 2 refs, got %d", len(refs))
	}

	root, ok := refs["rootCmd"]
	if !ok {
		t.Fatal("expected rootCmd ref")
	}
	if root.doc.FullName != "app" {
		t.Errorf("root FullName = %q, want %q", root.doc.FullName, "app")
	}
	if root.doc.Short != "Test app" {
		t.Errorf("root Short = %q, want %q", root.doc.Short, "Test app")
	}
	if root.doc.Long != "A longer description" {
		t.Errorf("root Long = %q, want %q", root.doc.Long, "A longer description")
	}
	if root.varName != "rootCmd" {
		t.Errorf("root varName = %q, want %q", root.varName, "rootCmd")
	}

	if len(root.doc.Flags) != 2 {
		t.Errorf("expected 2 flags on root, got %d", len(root.doc.Flags))
	}

	if _, ok := refs["subCmd"]; !ok {
		t.Error("expected subCmd ref")
	}

	if ref, ok := refs["main.newFactoryCmd"]; ok {
		if ref.doc.FullName != "factory" {
			t.Errorf("factory FullName = %q", ref.doc.FullName)
		}
		if len(ref.doc.Flags) != 1 {
			t.Errorf("expected 1 flag on factory cmd, got %d", len(ref.doc.Flags))
		}
	} else {
		t.Error("expected main.newFactoryCmd ref")
	}

	if _, ok := refs["main.newDirectCmd"]; !ok {
		t.Error("expected main.newDirectCmd ref")
	}

	if len(funcToVar) != 0 {
		t.Errorf("expected 0 funcToVar, got %d", len(funcToVar))
	}
}

func TestFindCmds_skipNonGoFiles(t *testing.T) {
	dir := t.TempDir()
	os.WriteFile(filepath.Join(dir, "readme.txt"), []byte("hello"), 0644)
	os.WriteFile(filepath.Join(dir, "main.js"), []byte("console.log"), 0644)

	refs, _, err := findCmds(dir)
	if err != nil {
		t.Fatal(err)
	}
	if len(refs) != 0 {
		t.Errorf("expected 0 refs, got %d", len(refs))
	}
}

func TestFindCmds_nonexistentDir(t *testing.T) {
	refs, funcToVar, err := findCmds("/nonexistent-path-for-test")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(refs) != 0 {
		t.Errorf("expected 0 refs, got %d", len(refs))
	}
	if len(funcToVar) != 0 {
		t.Errorf("expected 0 funcToVar mappings, got %d", len(funcToVar))
	}
}

func TestFindCmds_funcReturningVar(t *testing.T) {
	dir := t.TempDir()
	src := `package main
import "github.com/spf13/cobra"
var rootCmd = &cobra.Command{
	Use:   "app",
	Short: "App",
}
func newCmd() *cobra.Command {
	return rootCmd
}
`
	if err := os.WriteFile(filepath.Join(dir, "main.go"), []byte(src), 0644); err != nil {
		t.Fatal(err)
	}

	refs, funcToVar, err := findCmds(dir)
	if err != nil {
		t.Fatal(err)
	}
	if len(refs) != 1 {
		t.Errorf("expected 1 ref, got %d", len(refs))
	}
	if len(funcToVar) != 1 {
		t.Errorf("expected 1 funcToVar mapping, got %d", len(funcToVar))
	}
	if funcToVar["main.newCmd"] != "rootCmd" {
		t.Errorf("expected funcToVar[main.newCmd] = rootCmd, got %q", funcToVar["main.newCmd"])
	}
}

func TestFindAddCalls(t *testing.T) {
	dir := t.TempDir()
	src := `package main
import "github.com/spf13/cobra"
var rootCmd = &cobra.Command{
	Use:   "app",
	Short: "App",
}
var subCmd = &cobra.Command{
	Use:   "sub",
	Short: "Subcommand",
}
func init() {
	rootCmd.AddCommand(subCmd)
}
`
	if err := os.WriteFile(filepath.Join(dir, "main.go"), []byte(src), 0644); err != nil {
		t.Fatal(err)
	}

	refs, _, err := findCmds(dir)
	if err != nil {
		t.Fatal(err)
	}

	findAddCalls(dir, refs, nil)

	root, ok := refs["rootCmd"]
	if !ok {
		t.Fatal("expected rootCmd ref")
	}

	if len(root.children) != 1 || root.children[0] != "subCmd" {
		t.Errorf("expected rootCmd children = [subCmd], got %v", root.children)
	}
}

func TestFindAddCalls_funcToVarPath(t *testing.T) {
	dir := t.TempDir()
	src := `package main
import "github.com/spf13/cobra"
var rootCmd = &cobra.Command{
	Use:   "app",
	Short: "App",
}
var subCmd = &cobra.Command{
	Use:   "sub",
	Short: "Subcommand",
}
func newCmd() *cobra.Command {
	return subCmd
}
func init() {
	rootCmd.AddCommand(newCmd())
}
`
	if err := os.WriteFile(filepath.Join(dir, "main.go"), []byte(src), 0644); err != nil {
		t.Fatal(err)
	}

	refs, funcToVar, err := findCmds(dir)
	if err != nil {
		t.Fatal(err)
	}
	if _, ok := refs["rootCmd"]; !ok {
		t.Fatal("expected rootCmd ref")
	}
	if _, ok := refs["subCmd"]; !ok {
		t.Fatal("expected subCmd ref")
	}

	findAddCalls(dir, refs, funcToVar)

	root, ok := refs["rootCmd"]
	if !ok {
		t.Fatal("expected rootCmd ref")
	}
	if len(root.children) != 1 || root.children[0] != "subCmd" {
		t.Errorf("expected rootCmd children = [subCmd], got %v", root.children)
	}
}

func TestFindAddCalls_functionBased(t *testing.T) {
	dir := t.TempDir()
	src := `package main
import "github.com/spf13/cobra"
var rootCmd = &cobra.Command{
	Use:   "app",
	Short: "App",
}
func newSubCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "sub",
		Short: "Subcommand",
	}
	return cmd
}
func init() {
	rootCmd.AddCommand(newSubCmd())
}
`
	if err := os.WriteFile(filepath.Join(dir, "main.go"), []byte(src), 0644); err != nil {
		t.Fatal(err)
	}

	refs, funcToVar, err := findCmds(dir)
	if err != nil {
		t.Fatal(err)
	}

	findAddCalls(dir, refs, funcToVar)

	root, ok := refs["rootCmd"]
	if !ok {
		t.Fatal("expected rootCmd ref")
	}

	if len(root.children) != 1 {
		t.Fatalf("expected 1 child, got %d", len(root.children))
	}

	if root.children[0] != "main.newSubCmd" {
		t.Errorf("expected child main.newSubCmd, got %q", root.children[0])
	}
}

func TestBuildTree(t *testing.T) {
	refs := map[string]*cmdRef{
		"root": {
			doc:      commandDoc{FullName: "app"},
			varName:  "root",
			children: []string{"sub1", "sub2"},
		},
		"sub1": {
			doc:      commandDoc{FullName: "sub1"},
			varName:  "sub1",
			children: []string{"sub1a"},
		},
		"sub1a": {
			doc:     commandDoc{FullName: "sub1a"},
			varName: "sub1a",
		},
		"sub2": {
			doc:     commandDoc{FullName: "sub2"},
			varName: "sub2",
		},
	}

	roots := buildTree(refs)
	if len(roots) != 1 {
		t.Fatalf("expected 1 root, got %d", len(roots))
	}

	root := roots[0]
	if root.FullName != "app" {
		t.Errorf("root FullName = %q, want %q", root.FullName, "app")
	}

	if len(root.SubCommands) != 2 {
		t.Fatalf("expected 2 subcommands, got %d", len(root.SubCommands))
	}

	if root.SubCommands[0].FullName != "sub1" {
		t.Errorf("sub1 FullName = %q", root.SubCommands[0].FullName)
	}
	if len(root.SubCommands[0].SubCommands) != 1 {
		t.Fatalf("expected sub1 to have 1 child")
	}
	if root.SubCommands[0].SubCommands[0].FullName != "sub1a" {
		t.Errorf("sub1a FullName = %q", root.SubCommands[0].SubCommands[0].FullName)
	}
	if root.SubCommands[1].FullName != "sub2" {
		t.Errorf("sub2 FullName = %q", root.SubCommands[1].FullName)
	}
}

func TestBuildTree_emptyRefs(t *testing.T) {
	roots := buildTree(map[string]*cmdRef{})
	if len(roots) != 0 {
		t.Errorf("expected 0 roots, got %d", len(roots))
	}
}

func TestBuildTree_multipleRoots(t *testing.T) {
	refs := map[string]*cmdRef{
		"cmd1": {doc: commandDoc{FullName: "cmd1"}, varName: "cmd1"},
		"cmd2": {doc: commandDoc{FullName: "cmd2"}, varName: "cmd2"},
	}
	roots := buildTree(refs)
	if len(roots) != 2 {
		t.Fatalf("expected 2 roots, got %d", len(roots))
	}
}

func TestWireTree(t *testing.T) {
	refs := map[string]*cmdRef{
		"parent": {
			doc:      commandDoc{FullName: "parent"},
			children: []string{"child"},
		},
		"child": {
			doc:     commandDoc{FullName: "child"},
			varName: "child",
		},
	}

	doc := wireTree("parent", refs, map[string]bool{})
	if doc.FullName != "parent" {
		t.Errorf("FullName = %q, want %q", doc.FullName, "parent")
	}
	if len(doc.SubCommands) != 1 {
		t.Fatalf("expected 1 subcommand, got %d", len(doc.SubCommands))
	}
	if doc.SubCommands[0].FullName != "child" {
		t.Errorf("child FullName = %q", doc.SubCommands[0].FullName)
	}
}

func TestWireTree_nilRef(t *testing.T) {
	doc := wireTree("missing", map[string]*cmdRef{}, map[string]bool{})
	if doc.FullName != "" {
		t.Errorf("expected empty doc, got %+v", doc)
	}
}

func TestWireTree_visited(t *testing.T) {
	visited := map[string]bool{"test": true}
	doc := wireTree("test", map[string]*cmdRef{}, visited)
	if doc.FullName != "" {
		t.Errorf("expected empty doc for visited node")
	}
}

func TestWireTree_circular(t *testing.T) {
	refs := map[string]*cmdRef{
		"a": {doc: commandDoc{FullName: "a"}, children: []string{"b"}},
		"b": {doc: commandDoc{FullName: "b"}, children: []string{"a"}},
	}
	doc := wireTree("a", refs, map[string]bool{})
	if doc.FullName != "a" {
		t.Errorf("FullName = %q", doc.FullName)
	}
	if len(doc.SubCommands) != 1 {
		t.Fatalf("expected 1 subcommand, got %d", len(doc.SubCommands))
	}
	if doc.SubCommands[0].FullName != "b" {
		t.Errorf("child FullName = %q", doc.SubCommands[0].FullName)
	}
	if len(doc.SubCommands[0].SubCommands) != 0 {
		t.Errorf("expected circular ref to produce empty subcommand")
	}
}

func TestRenderTOC(t *testing.T) {
	doc := commandDoc{
		FullName: "app cmd",
		SubCommands: []commandDoc{
			{FullName: "sub1", Flags: []FlagDoc{{Name: "flag1"}}},
			{FullName: "sub2"},
		},
	}

	var buf bytes.Buffer
	count := 0
	renderTOC(&buf, doc, "app", &count)

	output := buf.String()
	if !strings.Contains(output, "- [`app`](#app)") {
		t.Error("expected root TOC entry")
	}
	if !strings.Contains(output, "[Table of Contents](#table-of-contents)") {
		t.Error("expected Table of Contents entry")
	}
	if !strings.Contains(output, "`app sub1`") {
		t.Error("expected sub1 entry")
	}
	if !strings.Contains(output, "`app sub2`") {
		t.Error("expected sub2 entry")
	}
	if !strings.Contains(output, "[Flags](#flags)") {
		t.Error("expected Flags entry")
	}
}

func TestRenderTOCEntry(t *testing.T) {
	t.Run("with flags", func(t *testing.T) {
		doc := commandDoc{
			FullName: "sub cmd",
			Flags:    []FlagDoc{{Name: "verbose"}},
		}
		var buf bytes.Buffer
		count := 0
		renderTOCEntry(&buf, doc, "root", "  ", &count)
		output := buf.String()
		if !strings.Contains(output, "`root sub`") {
			t.Error("expected root sub entry")
		}
		if !strings.Contains(output, "[Flags](#flags)") {
			t.Error("expected Flags")
		}
		if count != 1 {
			t.Errorf("expected flagCount=1, got %d", count)
		}
	})

	t.Run("with flags count 1", func(t *testing.T) {
		doc := commandDoc{
			FullName: "sub",
			Flags:    []FlagDoc{{Name: "f"}},
		}
		var buf bytes.Buffer
		count := 1
		renderTOCEntry(&buf, doc, "root", "  ", &count)
		output := buf.String()
		if !strings.Contains(output, "[Flags](#flags-1)") {
			t.Error("expected Flags with count 1")
		}
		if count != 2 {
			t.Errorf("expected flagCount=2, got %d", count)
		}
	})

	t.Run("no flags", func(t *testing.T) {
		doc := commandDoc{FullName: "sub"}
		var buf bytes.Buffer
		count := 0
		renderTOCEntry(&buf, doc, "root", "  ", &count)
		output := buf.String()
		if !strings.Contains(output, "`root sub`") {
			t.Error("expected root sub entry")
		}
		if strings.Contains(output, "Flags") {
			t.Error("expected no Flags section")
		}
	})

	t.Run("with subcommands", func(t *testing.T) {
		doc := commandDoc{
			FullName: "parent",
			SubCommands: []commandDoc{
				{FullName: "child"},
			},
		}
		var buf bytes.Buffer
		count := 0
		renderTOCEntry(&buf, doc, "root", "  ", &count)
		output := buf.String()
		if !strings.Contains(output, "`root parent`") {
			t.Error("expected root parent entry")
		}
		if !strings.Contains(output, "`root parent child`") {
			t.Error("expected child entry with full parent prefix")
		}
	})
}

func TestRenderFlags(t *testing.T) {
	t.Run("no flags", func(t *testing.T) {
		var buf bytes.Buffer
		renderFlags(&buf, nil, 2)
		if buf.Len() != 0 {
			t.Error("expected empty output for no flags")
		}
	})

	t.Run("with flags and shorthand", func(t *testing.T) {
		flags := []FlagDoc{
			{Name: "verbose", Shorthand: "v", DefaultValue: "false", Usage: "enable verbose"},
			{Name: "name", DefaultValue: "", Usage: "name to use"},
		}
		var buf bytes.Buffer
		renderFlags(&buf, flags, 2)
		output := buf.String()
		if !strings.Contains(output, "### Flags") {
			t.Error("expected ### Flags heading for level 2")
		}
		if !strings.Contains(output, "--verbose") {
			t.Error("expected --verbose flag")
		}
		if !strings.Contains(output, "-v") {
			t.Error("expected -v shorthand")
		}
		if !strings.Contains(output, "enable verbose") {
			t.Error("expected usage text")
		}
		if !strings.Contains(output, "--name") {
			t.Error("expected --name flag")
		}
	})

	t.Run("persistent flag", func(t *testing.T) {
		flags := []FlagDoc{
			{Name: "output", DefaultValue: "stdout", Usage: "output path", Persistent: true},
		}
		var buf bytes.Buffer
		renderFlags(&buf, flags, 1)
		output := buf.String()
		if !strings.Contains(output, "(persistent)") {
			t.Error("expected (persistent) marker")
		}
	})

	t.Run("level 1 heading", func(t *testing.T) {
		flags := []FlagDoc{{Name: "f"}}
		var buf bytes.Buffer
		renderFlags(&buf, flags, 1)
		if !strings.Contains(buf.String(), "## Flags") {
			t.Error("expected ## Flags heading for level 1")
		}
	})
}

func TestRenderCommand(t *testing.T) {
	t.Run("full command", func(t *testing.T) {
		doc := commandDoc{
			FullName: "sub name extra",
			Short:    "Short description",
			Long:     "Long description\nspanning lines",
			Example:  "sub --flag value",
			Flags:    []FlagDoc{{Name: "flag1", Usage: "a flag"}},
		}
		var buf bytes.Buffer
		renderCommand(doc, 2, "root", &buf)
		output := buf.String()

		if !strings.Contains(output, "## `root sub`") {
			t.Error("expected heading ## `root sub`")
		}
		if !strings.Contains(output, "Short description") {
			t.Error("expected short description")
		}
		if !strings.Contains(output, "Long description") {
			t.Error("expected long description")
		}
		if !strings.Contains(output, "root sub name extra") {
			t.Error("expected full usage with extra args")
		}
		if !strings.Contains(output, "sub --flag value") {
			t.Error("expected example")
		}
		if !strings.Contains(output, "--flag1") {
			t.Error("expected flag")
		}
		if !strings.Contains(output, "---") {
			t.Error("expected separator")
		}
	})

	t.Run("minimal command", func(t *testing.T) {
		doc := commandDoc{
			FullName: "simple",
		}
		var buf bytes.Buffer
		renderCommand(doc, 2, "root", &buf)
		output := buf.String()

		if !strings.Contains(output, "## `root simple`") {
			t.Error("expected heading")
		}
		if strings.Contains(output, "\n\n\n\n") {
			t.Error("unexpected blank sections")
		}
	})

	t.Run("with subcommands", func(t *testing.T) {
		doc := commandDoc{
			FullName: "parent",
			SubCommands: []commandDoc{
				{FullName: "child", Short: "Child command"},
			},
		}
		var buf bytes.Buffer
		renderCommand(doc, 2, "root", &buf)
		output := buf.String()

		if !strings.Contains(output, "### `root parent child`") {
			t.Error("expected subcommand heading")
		}
		if !strings.Contains(output, "Child command") {
			t.Error("expected child short description")
		}
	})

	t.Run("long equals short skips long output", func(t *testing.T) {
		doc := commandDoc{
			FullName: "dup",
			Long:     "same",
			Short:    "same",
		}
		var buf bytes.Buffer
		renderCommand(doc, 2, "root", &buf)
		output := buf.String()
		if !strings.Contains(output, "same") {
			t.Error("expected 'same' in output")
		}
	})
}

func TestGenerateDocs(t *testing.T) {
	dir := t.TempDir()
	src := `package main
import "github.com/spf13/cobra"
var rootCmd = &cobra.Command{
	Use:   "app",
	Short: "Test application",
	Long:  "A longer description of the test application",
}
var greetCmd = &cobra.Command{
	Use:   "greet",
	Short: "Greet someone",
}
func init() {
	rootCmd.Flags().BoolP("verbose", "v", false, "Enable verbose output")
	rootCmd.AddCommand(greetCmd)
}
`
	if err := os.WriteFile(filepath.Join(dir, "main.go"), []byte(src), 0644); err != nil {
		t.Fatal(err)
	}

	var buf bytes.Buffer
	err := generateDocs(dir, &buf)
	if err != nil {
		t.Fatal(err)
	}

	output := buf.String()
	if !strings.Contains(output, "# `app`") {
		t.Error("expected # `app` heading")
	}
	if !strings.Contains(output, "Test application") {
		t.Error("expected short description")
	}
	if !strings.Contains(output, "A longer description") {
		t.Error("expected long description")
	}
	if !strings.Contains(output, "Table of Contents") {
		t.Error("expected Table of Contents")
	}
	if !strings.Contains(output, "`app greet`") {
		t.Error("expected greet subcommand")
	}
	if !strings.Contains(output, "--verbose") {
		t.Error("expected --verbose flag in output")
	}
	if !strings.Contains(output, "---") {
		t.Error("expected separator")
	}
}

func TestGenerateDocs_noCmds(t *testing.T) {
	dir := t.TempDir()
	src := `package main
func main() {}
`
	if err := os.WriteFile(filepath.Join(dir, "main.go"), []byte(src), 0644); err != nil {
		t.Fatal(err)
	}

	var buf bytes.Buffer
	err := generateDocs(dir, &buf)
	if err == nil {
		t.Error("expected error for no cobra commands")
	}
	if !strings.Contains(err.Error(), "no cobra commands found") {
		t.Errorf("unexpected error: %v", err)
	}
}

func TestGenerateDocs_nonexistentDir(t *testing.T) {
	var buf bytes.Buffer
	err := generateDocs("/nonexistent-path-for-test", &buf)
	if err == nil {
		t.Error("expected error for nonexistent directory")
	}
}

func TestFindFlagsForCmd_nestedSelector(t *testing.T) {
	src := `package main
func init() {
	cmd.Flags().StringP("name", "n", "", "usage")
	cmd.Flags().String("other", "", "other usage")
}`
	f := parseFileNode(t, src)
	got := findFlagsForCmd(f, "cmd")
	if len(got) != 2 {
		t.Fatalf("expected 2 flags, got %d", len(got))
	}
	if got[0].Name != "name" || got[1].Name != "other" {
		t.Errorf("unexpected flags: %+v", got)
	}
}

func TestRenderCommand_noShort(t *testing.T) {
	doc := commandDoc{
		FullName: "cmd",
		Long:     "Only long description",
	}
	var buf bytes.Buffer
	renderCommand(doc, 2, "root", &buf)
	output := buf.String()
	if !strings.Contains(output, "Only long description") {
		t.Error("expected long description even without short")
	}
}

func TestRenderCommand_emptyLong(t *testing.T) {
	doc := commandDoc{
		FullName: "cmd",
		Short:    "Short description",
		Long:     "",
	}
	var buf bytes.Buffer
	renderCommand(doc, 2, "root", &buf)
	output := buf.String()
	if !strings.Contains(output, "Short description") {
		t.Error("expected short description")
	}
}

func TestRenderCommand_noExample(t *testing.T) {
	doc := commandDoc{
		FullName: "cmd",
		Short:    "Short",
	}
	var buf bytes.Buffer
	renderCommand(doc, 2, "root", &buf)
	output := buf.String()
	if strings.Contains(output, "Example") {
		t.Error("expected no Example when not set")
	}
}

func TestFindCmds_skipCompletion(t *testing.T) {
	dir := t.TempDir()
	src := `package main
import "github.com/spf13/cobra"
var completionCmd = &cobra.Command{
	Use:   "completion",
	Short: "Generate completion",
}
`
	if err := os.WriteFile(filepath.Join(dir, "main.go"), []byte(src), 0644); err != nil {
		t.Fatal(err)
	}
	refs, _, err := findCmds(dir)
	if err != nil {
		t.Fatal(err)
	}
	if _, ok := refs["completionCmd"]; ok {
		t.Error("completion command should be skipped")
	}
}

func TestRenderFlags_noShorthand(t *testing.T) {
	flags := []FlagDoc{
		{Name: "no-shorthand", DefaultValue: "val", Usage: "desc"},
	}
	var buf bytes.Buffer
	renderFlags(&buf, flags, 1)
	output := buf.String()
	if strings.Contains(output, "`-`") {
		t.Error("expected no shorthand column")
	}
}

func TestGenerateDocs_noSubcommands(t *testing.T) {
	dir := t.TempDir()
	src := `package main
import "github.com/spf13/cobra"
var rootCmd = &cobra.Command{
	Use:   "simple",
	Short: "A simple command with no subcommands",
}
`
	if err := os.WriteFile(filepath.Join(dir, "main.go"), []byte(src), 0644); err != nil {
		t.Fatal(err)
	}
	var buf bytes.Buffer
	err := generateDocs(dir, &buf)
	if err != nil {
		t.Fatal(err)
	}
	output := buf.String()
	if strings.Contains(output, "Table of Contents") {
		t.Error("expected no Table of Contents for command without subcommands")
	}
}
