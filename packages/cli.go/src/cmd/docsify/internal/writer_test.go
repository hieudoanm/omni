package internal

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestBuildDoc(t *testing.T) {
	g := NewGraph()
	info := &FileInfo{
		File: File{RelPath: "main.go", Lang: LangGo},
		Symbols: []Symbol{
			{Name: "Foo", Kind: KindFunction, Line: 10, Exported: true},
			{Name: "bar", Kind: KindVariable, Line: 20, Exported: false},
		},
		Calls: []CallEdge{
			{CallerName: "Foo", CalleeName: "bar", Line: 15},
		},
	}
	g.AddFile(info)

	doc := buildDoc(g)

	if doc.XMLNS != "http://graphml.graphdrawing.org/graphml" {
		t.Errorf("XMLNS = %q, want %q", doc.XMLNS, "http://graphml.graphdrawing.org/graphml")
	}
	if doc.Graph.ID != "codebase" {
		t.Errorf("Graph.ID = %q, want %q", doc.Graph.ID, "codebase")
	}
	if doc.Graph.EdgeDefault != "directed" {
		t.Errorf("EdgeDefault = %q, want %q", doc.Graph.EdgeDefault, "directed")
	}

	if len(doc.Graph.Meta) != 2 {
		t.Fatalf("expected 2 graph metadata entries, got %d", len(doc.Graph.Meta))
	}
	if doc.Graph.Meta[0].Key != "g_generated" || doc.Graph.Meta[0].Value == "" {
		t.Error("expected non-empty g_generated")
	}
	if doc.Graph.Meta[1].Key != "g_version" || doc.Graph.Meta[1].Value != "1" {
		t.Error("expected g_version = 1")
	}

	wantNodes := 3
	if len(doc.Graph.Nodes) != wantNodes {
		t.Fatalf("expected %d nodes (1 file + 2 symbols), got %d", wantNodes, len(doc.Graph.Nodes))
	}

	fileNode := doc.Graph.Nodes[0]
	if fileNode.ID == "" {
		t.Error("file node should have ID")
	}

	wantEdges := 3
	if len(doc.Graph.Edges) != wantEdges {
		t.Fatalf("expected %d edges (2 contains + 1 calls), got %d", wantEdges, len(doc.Graph.Edges))
	}

	hasContains := false
	hasCalls := false
	for _, e := range doc.Graph.Edges {
		for _, d := range e.Data {
			if d.Key == "e_kind" && d.Value == "contains" {
				hasContains = true
			}
			if d.Key == "e_kind" && d.Value == "calls" {
				hasCalls = true
			}
		}
	}
	if !hasContains {
		t.Error("expected at least one 'contains' edge")
	}
	if !hasCalls {
		t.Error("expected at least one 'calls' edge")
	}
}

func TestBuildDocNoEdges(t *testing.T) {
	g := NewGraph()
	info := &FileInfo{
		File:    File{RelPath: "empty.go", Lang: LangGo},
		Symbols: []Symbol{},
	}
	g.AddFile(info)

	doc := buildDoc(g)

	if len(doc.Graph.Nodes) != 1 {
		t.Errorf("expected 1 node (file only), got %d", len(doc.Graph.Nodes))
	}
	if len(doc.Graph.Edges) != 0 {
		t.Errorf("expected 0 edges, got %d", len(doc.Graph.Edges))
	}
}

func TestBuildDocKeys(t *testing.T) {
	g := NewGraph()
	info := &FileInfo{
		File: File{RelPath: "main.go", Lang: LangGo},
		Symbols: []Symbol{
			{Name: "Foo", Kind: KindFunction, Line: 1, Exported: true},
		},
	}
	g.AddFile(info)
	doc := buildDoc(g)

	totalKeys := len(graphKeys) + len(nodeKeys) + len(edgeKeys)
	if len(doc.Keys) != totalKeys {
		t.Errorf("expected %d keys, got %d", totalKeys, len(doc.Keys))
	}
}

func TestWrite(t *testing.T) {
	g := NewGraph()
	info := &FileInfo{
		File: File{RelPath: "main.go", Lang: LangGo},
		Symbols: []Symbol{
			{Name: "Foo", Kind: KindFunction, Line: 1, Exported: true},
		},
	}
	g.AddFile(info)

	path := filepath.Join(t.TempDir(), "output.graphml")
	err := Write(g, path)
	if err != nil {
		t.Fatal(err)
	}

	data, err := os.ReadFile(path)
	if err != nil {
		t.Fatal(err)
	}
	content := string(data)
	if !strings.Contains(content, "<graphml") {
		t.Error("expected graphml XML")
	}
	if !strings.Contains(content, "Foo") {
		t.Error("expected Foo symbol in graphml")
	}
	if !strings.Contains(content, "main.go") {
		t.Error("expected main.go in graphml")
	}
}

func TestWrite_emptyGraph(t *testing.T) {
	g := NewGraph()
	path := filepath.Join(t.TempDir(), "empty.graphml")
	err := Write(g, path)
	if err != nil {
		t.Fatal(err)
	}
	data, err := os.ReadFile(path)
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(string(data), "<graphml") {
		t.Error("expected graphml XML")
	}
}

func TestWrite_badPath(t *testing.T) {
	g := NewGraph()
	g.AddFile(&FileInfo{
		File: File{RelPath: "main.go", Lang: LangGo},
	})
	err := Write(g, "/nonexistent-test-path/output.graphml")
	if err == nil {
		t.Error("expected error for bad path")
	}
}
