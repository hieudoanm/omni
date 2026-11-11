package internal

import (
	"testing"
)

func TestNewGraph(t *testing.T) {
	g := NewGraph()
	if g == nil {
		t.Fatal("NewGraph returned nil")
	}
	if g.nodeByID == nil {
		t.Error("nodeByID map not initialized")
	}
	if g.symbolIndex == nil {
		t.Error("symbolIndex map not initialized")
	}
}

func TestGraphAddFileAndCounts(t *testing.T) {
	g := NewGraph()
	info := &FileInfo{
		File: File{RelPath: "main.go", Lang: LangGo},
		Symbols: []Symbol{
			{Name: "Foo", Kind: KindFunction, Line: 1, Exported: true},
			{Name: "bar", Kind: KindVariable, Line: 5, Exported: false},
		},
		Calls: []CallEdge{
			{CallerName: "Foo", CalleeName: "bar", Line: 3},
		},
	}
	g.AddFile(info)

	if g.NodeCount() != 3 {
		t.Errorf("expected 3 nodes (1 file + 2 symbols), got %d", g.NodeCount())
	}
	if g.EdgeCount() != 3 {
		t.Errorf("expected 3 edges (2 contains + 1 calls), got %d", g.EdgeCount())
	}
}

func TestGraphResolveCallEdges(t *testing.T) {
	g := NewGraph()
	info := &FileInfo{
		File: File{RelPath: "lib.go", Lang: LangGo},
		Symbols: []Symbol{
			{Name: "Helper", Kind: KindFunction, Line: 1, Exported: true},
			{Name: "Run", Kind: KindFunction, Line: 5, Exported: true},
		},
		Calls: []CallEdge{
			{CallerName: "Run", CalleeName: "Helper", Line: 6},
		},
	}
	g.AddFile(info)
	g.ResolveCallEdges()

	for _, e := range g.Edges {
		if e.Kind != EdgeCalls {
			continue
		}
		if len(e.Target) == 0 || e.Target == "UNRESOLVED:Helper" {
			t.Errorf("call edge target should be resolved, got %q", e.Target)
		}
	}
}

func TestGraphResolveCallEdges_dropsUnresolvable(t *testing.T) {
	g := NewGraph()
	info := &FileInfo{
		File: File{RelPath: "main.go", Lang: LangGo},
		Symbols: []Symbol{
			{Name: "Main", Kind: KindFunction, Line: 1, Exported: true},
		},
		Calls: []CallEdge{
			{CallerName: "Main", CalleeName: "NonExistent", Line: 2},
		},
	}
	g.AddFile(info)
	before := g.EdgeCount()
	g.ResolveCallEdges()
	after := g.EdgeCount()
	if after >= before {
		t.Errorf("expected unresolved edge to be dropped; before=%d after=%d", before, after)
	}
}

func TestGraphResolveCallEdges_multipleTargets(t *testing.T) {
	g := NewGraph()
	info1 := &FileInfo{
		File: File{RelPath: "a.go", Lang: LangGo},
		Symbols: []Symbol{
			{Name: "Run", Kind: KindFunction, Line: 1, Exported: true},
		},
		Calls: []CallEdge{
			{CallerName: "Run", CalleeName: "Helper", Line: 2},
		},
	}
	info2 := &FileInfo{
		File: File{RelPath: "b.go", Lang: LangGo},
		Symbols: []Symbol{
			{Name: "Helper", Kind: KindFunction, Line: 1, Exported: true},
		},
	}
	info3 := &FileInfo{
		File: File{RelPath: "c.go", Lang: LangGo},
		Symbols: []Symbol{
			{Name: "Helper", Kind: KindFunction, Line: 1, Exported: true},
		},
	}
	g.AddFile(info1)
	g.AddFile(info2)
	g.AddFile(info3)
	g.ResolveCallEdges()

	var callEdges int
	for _, e := range g.Edges {
		if e.Kind == EdgeCalls {
			callEdges++
		}
	}
	if callEdges != 2 {
		t.Errorf("expected 2 call edges (one per Helper), got %d", callEdges)
	}
}

func TestSanitizeID(t *testing.T) {
	tests := []struct {
		input    string
		expected string
	}{
		{"file:main.go", "file_main_go"},
		{"sym:pkg/Foo:10", "sym_pkg_Foo_10"},
		{"path/to/file", "path_to_file"},
		{"a-b c:d", "a_b_c_d"},
		{"plain", "plain"},
		{"", ""},
	}
	for _, tc := range tests {
		got := sanitizeID(tc.input)
		if got != tc.expected {
			t.Errorf("sanitizeID(%q) = %q, want %q", tc.input, got, tc.expected)
		}
	}
}

func TestSymbolKind(t *testing.T) {
	tests := []struct {
		kind     SymbolKind
		expected NodeKind
	}{
		{KindFunction, NodeFunction},
		{KindMethod, NodeMethod},
		{KindType, NodeType},
		{KindInterface, NodeInterface},
		{KindClass, NodeClass},
		{KindVariable, NodeVariable},
		{KindConstant, NodeConstant},
		{SymbolKind("unknown"), NodeFunction},
	}
	for _, tc := range tests {
		got := symbolKind(tc.kind)
		if got != tc.expected {
			t.Errorf("symbolKind(%q) = %q, want %q", tc.kind, got, tc.expected)
		}
	}
}

func TestGraphAddFile_duplicateNode(t *testing.T) {
	g := NewGraph()
	info := &FileInfo{
		File: File{RelPath: "main.go", Lang: LangGo},
		Symbols: []Symbol{
			{Name: "Foo", Kind: KindFunction, Line: 1, Exported: true},
		},
	}
	g.AddFile(info)
	g.AddFile(info)
	if g.NodeCount() != 2 {
		t.Errorf("expected 2 nodes (deduplicated), got %d", g.NodeCount())
	}
}

func TestGraphEdgeIDSequential(t *testing.T) {
	g := NewGraph()
	e1 := g.nextEdgeID()
	e2 := g.nextEdgeID()
	if e1 == e2 {
		t.Error("edge IDs should be sequential and unique")
	}
	if e1 != "e1" || e2 != "e2" {
		t.Errorf("expected e1, e2; got %q, %q", e1, e2)
	}
}
