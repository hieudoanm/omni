package obsidian

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestWikiLinkRe_basic(t *testing.T) {
	matches := wikiLinkRe.FindAllStringSubmatch("Here is [[page]] link", -1)
	if len(matches) != 1 {
		t.Fatalf("expected 1 match, got %d", len(matches))
	}
	if matches[0][1] != "page" {
		t.Errorf("expected page name %q, got %q", "page", matches[0][1])
	}
}

func TestWikiLinkRe_withAlias(t *testing.T) {
	matches := wikiLinkRe.FindAllStringSubmatch("See [[target|display text]] here", -1)
	if len(matches) != 1 {
		t.Fatalf("expected 1 match, got %d", len(matches))
	}
	if matches[0][1] != "target" {
		t.Errorf("expected target %q, got %q", "target", matches[0][1])
	}
}

func TestWikiLinkRe_multiple(t *testing.T) {
	src := "Links: [[one]], [[two|alias]], and [[three]]"
	matches := wikiLinkRe.FindAllStringSubmatch(src, -1)
	if len(matches) != 3 {
		t.Fatalf("expected 3 matches, got %d", len(matches))
	}
	expected := []string{"one", "two", "three"}
	for i, m := range matches {
		if m[1] != expected[i] {
			t.Errorf("match %d: expected %q, got %q", i, expected[i], m[1])
		}
	}
}

func TestWikiLinkRe_noMatch(t *testing.T) {
	tests := []string{
		"No brackets here",
		"Just [text] in brackets",
		"[[incomplete",
		"no closing]]",
		"[[]]",
		"[a]",
	}
	for _, s := range tests {
		if wikiLinkRe.MatchString(s) {
			t.Errorf("expected no match for %q", s)
		}
	}
}

func TestWikiLinkRe_invalidPipe(t *testing.T) {
	matches := wikiLinkRe.FindAllStringSubmatch("[[page|]]", -1)
	if len(matches) != 0 {
		t.Errorf("expected 0 matches for empty alias, got %d", len(matches))
	}
}

func TestWikiLinkRe_nestedBrackets(t *testing.T) {
	matches := wikiLinkRe.FindAllStringSubmatch("Not [[page [inner]] match", -1)
	if len(matches) != 1 {
		t.Fatalf("expected 1 match, got %d", len(matches))
	}
	if matches[0][1] != "page [inner" {
		t.Errorf("expected %q, got %q", "page [inner", matches[0][1])
	}
}

func TestBuildGraph(t *testing.T) {
	dir := t.TempDir()

	makeFile := func(p string, content string) {
		p = filepath.Join(dir, p)
		if err := os.MkdirAll(filepath.Dir(p), 0755); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(p, []byte(content), 0644); err != nil {
			t.Fatal(err)
		}
	}

	makeFile("index.md", "Welcome to [[about]] and [[contact]]")
	makeFile("about.md", "About page with [[index]] link")
	makeFile("contact.md", "Contact info")
	makeFile("orphan.md", "No links here")
	makeFile("sub/deep.md", "Deep file linking to [[index]]")

	nodes, edges, err := buildGraph(dir, map[string]bool{})
	if err != nil {
		t.Fatal(err)
	}

	if len(nodes) != 5 {
		t.Fatalf("expected 5 nodes, got %d", len(nodes))
	}

	relPaths := make(map[string]string)
	pathMap := make(map[string]string)
	for _, n := range nodes {
		relPaths[n.Label] = n.ID
		pathMap[n.Label] = n.Path
	}

	if _, ok := relPaths["index"]; !ok {
		t.Error("expected 'index' node")
	}

	if pathMap["deep"] != "sub/deep.md" {
		t.Errorf("deep path = %q, want %q", pathMap["deep"], "sub/deep.md")
	}

	edgePairs := make(map[string]bool)
	for _, e := range edges {
		edgePairs[e.Source+"->"+e.Target] = true
	}

	expectedEdges := []string{
		"index.md->about.md",
		"index.md->contact.md",
		"about.md->index.md",
		"sub/deep.md->index.md",
	}
	for _, ee := range expectedEdges {
		if !edgePairs[ee] {
			t.Errorf("missing edge %s", ee)
		}
	}

	for _, n := range nodes {
		switch n.Label {
		case "index":
			if n.Links != 2 {
				t.Errorf("index should have 2 links (to about, contact), got %d", n.Links)
			}
		case "orphan":
			if n.Links != 0 {
				t.Errorf("orphan should have 0 links, got %d", n.Links)
			}
		}
	}
}

func TestBuildGraph_skipDotDirs(t *testing.T) {
	dir := t.TempDir()
	os.MkdirAll(filepath.Join(dir, ".hidden"), 0755)
	os.WriteFile(filepath.Join(dir, ".hidden", "secret.md"), []byte("hidden"), 0644)
	os.WriteFile(filepath.Join(dir, "visible.md"), []byte("visible"), 0644)

	nodes, _, err := buildGraph(dir, map[string]bool{})
	if err != nil {
		t.Fatal(err)
	}

	for _, n := range nodes {
		if n.ID == ".hidden/secret.md" {
			t.Error("expected .hidden directory to be skipped")
		}
	}
	if len(nodes) != 1 {
		t.Errorf("expected 1 node (visible), got %d", len(nodes))
	}
}

func TestBuildGraph_skipExcluded(t *testing.T) {
	dir := t.TempDir()
	os.MkdirAll(filepath.Join(dir, "vendor"), 0755)
	os.WriteFile(filepath.Join(dir, "vendor", "pkg.md"), []byte("skip"), 0644)
	os.WriteFile(filepath.Join(dir, "readme.md"), []byte("keep"), 0644)

	nodes, _, err := buildGraph(dir, map[string]bool{"vendor": true})
	if err != nil {
		t.Fatal(err)
	}
	if len(nodes) != 1 {
		t.Errorf("expected 1 node (readme), got %d", len(nodes))
	}
}

func TestBuildGraph_skipNonMarkdown(t *testing.T) {
	dir := t.TempDir()
	os.WriteFile(filepath.Join(dir, "main.go"), []byte("package main"), 0644)
	os.WriteFile(filepath.Join(dir, "doc.md"), []byte("content"), 0644)

	nodes, _, err := buildGraph(dir, map[string]bool{})
	if err != nil {
		t.Fatal(err)
	}
	if len(nodes) != 1 {
		t.Errorf("expected 1 node (doc), got %d", len(nodes))
	}
}

func TestBuildGraph_caseInsensitiveLookup(t *testing.T) {
	dir := t.TempDir()
	os.WriteFile(filepath.Join(dir, "ReadMe.md"), []byte("See [[readme]]"), 0644)

	nodes, edges, err := buildGraph(dir, map[string]bool{})
	if err != nil {
		t.Fatal(err)
	}
	if len(nodes) != 1 {
		t.Fatalf("expected 1 node, got %d", len(nodes))
	}
	if len(edges) != 1 {
		t.Errorf("expected 1 self-loop edge, got %d", len(edges))
	}
}

func TestWriteJSON(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "out.json")
	nodes := []node{
		{ID: "file1.md", Label: "file1", Path: "file1.md", Links: 2},
		{ID: "file2.md", Label: "file2", Path: "file2.md", Links: 0},
	}
	edges := []edge{
		{Source: "file1.md", Target: "file2.md"},
	}
	err := writeJSON(nodes, edges, path)
	if err != nil {
		t.Fatal(err)
	}

	data, err := os.ReadFile(path)
	if err != nil {
		t.Fatal(err)
	}
	var g graph
	if err := json.Unmarshal(data, &g); err != nil {
		t.Fatal(err)
	}
	if len(g.Nodes) != 2 {
		t.Errorf("expected 2 nodes, got %d", len(g.Nodes))
	}
	if len(g.Links) != 1 {
		t.Errorf("expected 1 link, got %d", len(g.Links))
	}
	if g.Nodes[0].Label != "file1" {
		t.Errorf("node label = %q, want %q", g.Nodes[0].Label, "file1")
	}
	if g.Nodes[0].Size != 2 {
		t.Errorf("node size = %d, want %d", g.Nodes[0].Size, 2)
	}
	if g.Nodes[0].Path != "file1.md" {
		t.Errorf("node path = %q, want %q", g.Nodes[0].Path, "file1.md")
	}
}

func TestWriteDOT(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "out.dot")
	nodes := []node{
		{ID: "a.md", Label: "a", Links: 1},
		{ID: "b.md", Label: "b", Links: 0},
	}
	edges := []edge{
		{Source: "a.md", Target: "b.md"},
	}
	err := writeDOT(nodes, edges, path)
	if err != nil {
		t.Fatal(err)
	}

	data, err := os.ReadFile(path)
	if err != nil {
		t.Fatal(err)
	}
	output := string(data)
	if !strings.Contains(output, "digraph obsidian") {
		t.Error("expected digraph header")
	}
	if !strings.Contains(output, `"a.md"`) {
		t.Error("expected node a.md")
	}
	if !strings.Contains(output, `"b.md"`) {
		t.Error("expected node b.md")
	}
	if !strings.Contains(output, `"a.md" -> "b.md"`) {
		t.Error("expected edge")
	}
}

func TestWriteDOT_empty(t *testing.T) {
	path := filepath.Join(t.TempDir(), "empty.dot")
	err := writeDOT(nil, nil, path)
	if err != nil {
		t.Fatal(err)
	}
	data, _ := os.ReadFile(path)
	output := string(data)
	if !strings.Contains(output, "digraph obsidian") {
		t.Error("expected digraph header")
	}
}

func TestWriteEdges(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "edges.txt")
	nodes := []node{
		{ID: "a.md", Label: "a", Links: 1},
	}
	edges := []edge{
		{Source: "a.md", Target: "b.md"},
		{Source: "b.md", Target: "c.md"},
	}
	err := writeEdges(nodes, edges, path)
	if err != nil {
		t.Fatal(err)
	}

	data, err := os.ReadFile(path)
	if err != nil {
		t.Fatal(err)
	}
	output := string(data)
	if !strings.Contains(output, "a.md -> b.md") {
		t.Error("expected edge a.md -> b.md")
	}
	if !strings.Contains(output, "b.md -> c.md") {
		t.Error("expected edge b.md -> c.md")
	}
}

func TestWriteEdges_empty(t *testing.T) {
	path := filepath.Join(t.TempDir(), "empty.txt")
	err := writeEdges(nil, nil, path)
	if err != nil {
		t.Fatal(err)
	}
}

func TestWriteOutput(t *testing.T) {
	path := filepath.Join(t.TempDir(), "out.txt")
	err := writeOutput([]byte("hello world"), path)
	if err != nil {
		t.Fatal(err)
	}
	data, err := os.ReadFile(path)
	if err != nil {
		t.Fatal(err)
	}
	if string(data) != "hello world" {
		t.Errorf("expected 'hello world', got %q", string(data))
	}
}

func TestWriteOutput_emptyPath(t *testing.T) {
	err := writeOutput([]byte("data"), "")
	if err != nil {
		t.Fatal(err)
	}
}

func TestRunObsidian_DotFormat(t *testing.T) {
	dir := t.TempDir()
	os.WriteFile(filepath.Join(dir, "test.md"), []byte("[[other]]"), 0644)
	os.WriteFile(filepath.Join(dir, "other.md"), []byte("content"), 0644)
	out := filepath.Join(dir, "out.dot")

	err := runObsidian(dir, out, "dot", "")
	if err != nil {
		t.Fatal(err)
	}
	data, _ := os.ReadFile(out)
	if !strings.Contains(string(data), "digraph obsidian") {
		t.Error("expected DOT format output")
	}
}

func TestRunObsidian_EdgesFormat(t *testing.T) {
	dir := t.TempDir()
	os.WriteFile(filepath.Join(dir, "test.md"), []byte("[[other]]"), 0644)
	os.WriteFile(filepath.Join(dir, "other.md"), []byte("content"), 0644)
	out := filepath.Join(dir, "out.edges")

	err := runObsidian(dir, out, "edges", "")
	if err != nil {
		t.Fatal(err)
	}
	data, _ := os.ReadFile(out)
	if !strings.Contains(string(data), "->") {
		t.Error("expected edges format output")
	}
}

func TestRunObsidian_JSONFormat(t *testing.T) {
	dir := t.TempDir()
	os.WriteFile(filepath.Join(dir, "test.md"), []byte("[[other]]"), 0644)
	os.WriteFile(filepath.Join(dir, "other.md"), []byte("content"), 0644)
	out := filepath.Join(dir, "out.json")

	err := runObsidian(dir, out, "json", "")
	if err != nil {
		t.Fatal(err)
	}
	data, _ := os.ReadFile(out)
	if !strings.Contains(string(data), `"nodes"`) {
		t.Error("expected JSON with nodes array")
	}
	if !strings.Contains(string(data), `"links"`) {
		t.Error("expected JSON with links array")
	}
}

func TestRunObsidian_OutputToBadPath(t *testing.T) {
	err := runObsidian(".", "/nonexistent-deep/output.json", "dot", "")
	if err == nil {
		t.Error("expected error for bad output path")
	}
}
