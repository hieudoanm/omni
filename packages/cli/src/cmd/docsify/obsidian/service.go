package obsidian

import (
	"bufio"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/docsify/internal"
)

type node struct {
	ID    string `json:"id"`
	Label string `json:"label"`
	Path  string `json:"path"`
	Group int    `json:"group,omitempty"`
	Size  int    `json:"size,omitempty"`
	Links int    `json:"-"`
}

type edge struct {
	Source string `json:"source"`
	Target string `json:"target"`
}

type graph struct {
	Nodes []node `json:"nodes"`
	Links []edge `json:"links"`
}

var wikiLinkRe = regexp.MustCompile(`\[\[([^\]|]+)(?:\|[^\]|]+)?\]\]`)

func runObsidian(dir, out, format, exclude string) error {
	absDir, err := filepath.Abs(dir)
	if err != nil {
		return fmt.Errorf("resolve directory: %w", err)
	}
	excludeSet := internal.ParseExcludeList(exclude)
	nodes, edges, err := buildGraph(absDir, excludeSet)
	if err != nil {
		return err
	}
	switch format {
	case "json":
		return writeJSON(nodes, edges, out)
	case "dot":
		return writeDOT(nodes, edges, out)
	default:
		return writeEdges(nodes, edges, out)
	}
}

func buildGraph(root string, exclude map[string]bool) ([]node, []edge, error) {
	markdownFiles := make(map[string]string)
	links := make(map[string][]string)

	err := filepath.WalkDir(root, func(path string, d os.DirEntry, err error) error {
		if err != nil {
			return nil
		}
		name := d.Name()
		if name != "." && name[0] == '.' && d.IsDir() {
			return filepath.SkipDir
		}
		if d.IsDir() && exclude[name] {
			return filepath.SkipDir
		}
		if d.IsDir() {
			return nil
		}
		if !strings.EqualFold(filepath.Ext(name), ".md") {
			return nil
		}

		markdownFiles[path] = strings.TrimSuffix(name, ".md")

		f, err := os.Open(path)
		if err != nil {
			return nil
		}
		defer f.Close()

		var fileLinks []string
		scanner := bufio.NewScanner(f)
		for scanner.Scan() {
			matches := wikiLinkRe.FindAllStringSubmatch(scanner.Text(), -1)
			for _, m := range matches {
				fileLinks = append(fileLinks, m[1])
			}
		}
		if len(fileLinks) > 0 {
			links[path] = fileLinks
		}
		return nil
	})
	if err != nil {
		return nil, nil, err
	}

	lookup := make(map[string]string)
	for absPath, displayName := range markdownFiles {
		lookup[strings.ToLower(displayName)] = absPath
	}

	sortedPaths := make([]string, 0, len(markdownFiles))
	for p := range markdownFiles {
		sortedPaths = append(sortedPaths, p)
	}
	sort.Strings(sortedPaths)

	relMap := make(map[string]string)
	nodeMap := make(map[string]int)
	nodes := make([]node, 0, len(markdownFiles))
	for _, p := range sortedPaths {
		rel, _ := filepath.Rel(root, p)
		relMap[p] = rel
		group := 0
		if d := filepath.Dir(rel); d != "." {
			group = len(strings.Split(d, string(filepath.Separator)))
		}
		nodeMap[p] = len(nodes)
		nodes = append(nodes, node{
			ID:    rel,
			Label: markdownFiles[p],
			Path:  rel,
			Group: group,
		})
	}

	edgeSet := make(map[string]bool)
	var edges []edge

	for sourcePath, targets := range links {
		srcIdx, srcOk := nodeMap[sourcePath]
		if !srcOk {
			continue
		}
		for _, t := range targets {
			targetPath, ok := lookup[strings.ToLower(t)]
			if !ok {
				continue
			}
			tgtIdx, ok := nodeMap[targetPath]
			if !ok {
				continue
			}
			key := fmt.Sprintf("%d->%d", srcIdx, tgtIdx)
			if edgeSet[key] {
				continue
			}
			edgeSet[key] = true
			edges = append(edges, edge{
				Source: relMap[sourcePath],
				Target: relMap[targetPath],
			})
			nodes[srcIdx].Links++
		}
	}

	return nodes, edges, nil
}

func writeJSON(nodes []node, edges []edge, path string) error {
	for i := range nodes {
		nodes[i].Size = nodes[i].Links
	}
	g := graph{
		Nodes: nodes,
		Links: edges,
	}
	data, err := json.MarshalIndent(g, "", "  ")
	if err != nil {
		return err
	}
	return writeOutput(data, path)
}

func writeDOT(nodes []node, edges []edge, path string) error {
	var b strings.Builder
	b.WriteString("digraph obsidian {\n")
	b.WriteString("  rankdir=LR;\n")
	b.WriteString("  node [shape=box style=rounded];\n\n")

	for _, n := range nodes {
		label := strings.NewReplacer(`"`, `\"`).Replace(n.Label)
		b.WriteString(fmt.Sprintf("  %q [label=%q];\n", n.ID, label))
	}

	b.WriteString("\n")

	for _, e := range edges {
		b.WriteString(fmt.Sprintf("  %q -> %q;\n", e.Source, e.Target))
	}

	b.WriteString("}\n")
	return writeOutput([]byte(b.String()), path)
}

func writeEdges(nodes []node, edges []edge, path string) error {
	var b strings.Builder
	for _, e := range edges {
		b.WriteString(fmt.Sprintf("%s -> %s\n", e.Source, e.Target))
	}
	return writeOutput([]byte(b.String()), path)
}

func writeOutput(data []byte, path string) error {
	if path == "" {
		_, err := os.Stdout.Write(data)
		return err
	}
	return os.WriteFile(path, data, 0644)
}
