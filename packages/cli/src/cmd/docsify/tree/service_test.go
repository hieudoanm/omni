package tree

import (
	"bytes"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestMatchAnySegment(t *testing.T) {
	tests := []struct {
		pattern string
		path    string
		want    bool
	}{
		{"node_modules", "a/b/node_modules/c/d", true},
		{"node_modules", "src/node_modules", true},
		{"*.pyc", "src/__pycache__/foo.pyc", true},
		{"*.pyc", "src/main.py", false},
		{"dist", "dist/index.js", true},
		{"dist", "src/dist/index.js", true},
		{"nonexistent", "a/b/c", false},
	}
	for _, tc := range tests {
		got := matchAnySegment(tc.pattern, tc.path)
		if got != tc.want {
			t.Errorf("matchAnySegment(%q, %q) = %v, want %v", tc.pattern, tc.path, got, tc.want)
		}
	}
}

func TestLoadGitignore_noFile(t *testing.T) {
	dir := t.TempDir()
	ignore, err := loadGitignore(dir)
	if err != nil {
		t.Fatal(err)
	}
	if ignore.ignore("anything", false) {
		t.Error("expected no ignores when no .gitignore exists")
	}
}

func TestLoadGitignore_basicRules(t *testing.T) {
	dir := t.TempDir()
	gi := filepath.Join(dir, ".gitignore")
	content := `node_modules
dist
*.log
`
	if err := os.WriteFile(gi, []byte(content), 0644); err != nil {
		t.Fatal(err)
	}

	ignore, err := loadGitignore(dir)
	if err != nil {
		t.Fatal(err)
	}

	tests := []struct {
		path  string
		isDir bool
		want  bool
	}{
		{"node_modules/pkg/index.js", false, true},
		{"node_modules", true, true},
		{"dist/bundle.js", false, true},
		{"error.log", false, true},
		{"src/main.go", false, false},
		{"README.md", false, false},
	}
	for _, tc := range tests {
		got := ignore.ignore(tc.path, tc.isDir)
		if got != tc.want {
			t.Errorf("ignore(%q, isDir=%v) = %v, want %v", tc.path, tc.isDir, got, tc.want)
		}
	}
}

func TestLoadGitignore_negation(t *testing.T) {
	dir := t.TempDir()
	gi := filepath.Join(dir, ".gitignore")
	content := `*.log
!important.log
`
	if err := os.WriteFile(gi, []byte(content), 0644); err != nil {
		t.Fatal(err)
	}

	ignore, err := loadGitignore(dir)
	if err != nil {
		t.Fatal(err)
	}

	if !ignore.ignore("debug.log", false) {
		t.Error("debug.log should be ignored")
	}
	if ignore.ignore("important.log", false) {
		t.Error("important.log should not be ignored (negation)")
	}
}

func TestLoadGitignore_dirOnlyPattern(t *testing.T) {
	dir := t.TempDir()
	gi := filepath.Join(dir, ".gitignore")
	content := `build/
`
	if err := os.WriteFile(gi, []byte(content), 0644); err != nil {
		t.Fatal(err)
	}

	ignore, err := loadGitignore(dir)
	if err != nil {
		t.Fatal(err)
	}

	if !ignore.ignore("build", true) {
		t.Error("build/ should ignore directories named build")
	}
	if ignore.ignore("build/output.txt", false) {
		t.Error("build/ should not ignore files named build/output.txt (dirOnly)")
	}
}

func TestLoadGitignore_commentsAndEmptyLines(t *testing.T) {
	dir := t.TempDir()
	gi := filepath.Join(dir, ".gitignore")
	content := `# this is a comment

node_modules
`
	if err := os.WriteFile(gi, []byte(content), 0644); err != nil {
		t.Fatal(err)
	}

	ignore, err := loadGitignore(dir)
	if err != nil {
		t.Fatal(err)
	}

	if !ignore.ignore("node_modules/pkg.js", false) {
		t.Error("node_modules should be ignored")
	}
	if ignore.ignore("src/main.go", false) {
		t.Error("src/main.go should not be ignored")
	}
}

func TestMakeSet(t *testing.T) {
	tests := []struct {
		name  string
		input []string
		want  map[string]bool
	}{
		{"nil slice", nil, map[string]bool{}},
		{"empty slice", []string{}, map[string]bool{}},
		{"single item", []string{"a"}, map[string]bool{"a": true}},
		{"multiple items", []string{"a", "b", "c"}, map[string]bool{"a": true, "b": true, "c": true}},
		{"duplicates", []string{"a", "a", "b"}, map[string]bool{"a": true, "b": true}},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			got := makeSet(tc.input)
			if len(got) != len(tc.want) {
				t.Errorf("makeSet = %v (len=%d), want %v (len=%d)", got, len(got), tc.want, len(tc.want))
			}
			for k := range tc.want {
				if !got[k] {
					t.Errorf("makeSet missing key %q", k)
				}
			}
		})
	}
}

func TestMergeIgnores(t *testing.T) {
	t.Run("both nil", func(t *testing.T) {
		got := mergeIgnores(nil, nil)
		if got != nil {
			t.Errorf("expected nil, got %+v", got)
		}
	})

	t.Run("parent only", func(t *testing.T) {
		parent := &gitIgnore{dir: "/root", rules: []gitIgnoreRule{{pattern: "node_modules"}}}
		got := mergeIgnores(parent, nil)
		if got == nil {
			t.Fatal("expected non-nil")
		}
		if len(got.rules) != 1 || got.rules[0].pattern != "node_modules" {
			t.Errorf("unexpected merged rules: %+v", got.rules)
		}
	})

	t.Run("child only", func(t *testing.T) {
		child := &gitIgnore{dir: "/root", rules: []gitIgnoreRule{{pattern: "*.log"}}}
		got := mergeIgnores(nil, child)
		if got == nil {
			t.Fatal("expected non-nil")
		}
		if len(got.rules) != 1 || got.rules[0].pattern != "*.log" {
			t.Errorf("unexpected merged rules: %+v", got.rules)
		}
	})

	t.Run("merges parent and child with subdir prefix", func(t *testing.T) {
		parent := &gitIgnore{dir: "/root", rules: []gitIgnoreRule{{pattern: "node_modules"}}}
		child := &gitIgnore{dir: "/root/sub", rules: []gitIgnoreRule{{pattern: "build/"}}}
		got := mergeIgnores(parent, child)
		if got == nil {
			t.Fatal("expected non-nil")
		}
		if len(got.rules) != 2 {
			t.Fatalf("expected 2 rules, got %d", len(got.rules))
		}
		if got.rules[0].pattern != "node_modules" {
			t.Errorf("expected first rule 'node_modules', got %q", got.rules[0].pattern)
		}
		if got.rules[1].pattern != "sub/build/" {
			t.Errorf("expected child rule prefixed to 'sub/build/', got %q", got.rules[1].pattern)
		}
	})

	t.Run("child without slash pattern keeps original", func(t *testing.T) {
		parent := &gitIgnore{dir: "/root", rules: []gitIgnoreRule{{pattern: "dist"}}}
		child := &gitIgnore{dir: "/root/sub", rules: []gitIgnoreRule{{pattern: "tmp"}}}
		got := mergeIgnores(parent, child)
		if got == nil {
			t.Fatal("expected non-nil")
		}
		if len(got.rules) != 2 {
			t.Fatalf("expected 2 rules, got %d", len(got.rules))
		}
		if got.rules[1].pattern != "tmp" {
			t.Errorf("expected child rule unchanged, got %q", got.rules[1].pattern)
		}
	})

	t.Run("same directory does not prefix", func(t *testing.T) {
		parent := &gitIgnore{dir: "/root", rules: []gitIgnoreRule{{pattern: "dist"}}}
		child := &gitIgnore{dir: "/root", rules: []gitIgnoreRule{{pattern: "*.log"}}}
		got := mergeIgnores(parent, child)
		if got == nil {
			t.Fatal("expected non-nil")
		}
		if len(got.rules) != 2 {
			t.Fatalf("expected 2 rules, got %d", len(got.rules))
		}
		if got.rules[1].pattern != "*.log" {
			t.Errorf("expected child rule unchanged, got %q", got.rules[1].pattern)
		}
	})
}

func TestWriteTree(t *testing.T) {
	dir := t.TempDir()
	os.MkdirAll(filepath.Join(dir, "subdir"), 0755)
	os.WriteFile(filepath.Join(dir, "file1.go"), []byte("package main"), 0644)
	os.WriteFile(filepath.Join(dir, "subdir", "file2.go"), []byte("package main"), 0644)
	os.WriteFile(filepath.Join(dir, ".hidden"), []byte("hidden"), 0644)

	var buf bytes.Buffer
	dirs, files, err := writeTree(&buf, dir, dir, "", nil, nil, nil)
	if err != nil {
		t.Fatal(err)
	}
	if dirs != 1 {
		t.Errorf("expected 1 dir, got %d", dirs)
	}
	if files != 2 {
		t.Errorf("expected 2 files, got %d", files)
	}

	output := buf.String()
	if !strings.Contains(output, "subdir/") {
		t.Error("expected subdir/ in output")
	}
	if !strings.Contains(output, "file1.go") {
		t.Error("expected file1.go in output")
	}
	if !strings.Contains(output, "[file1.go]") {
		t.Error("expected link for file1.go")
	}
	if strings.Contains(output, ".hidden") {
		t.Error("expected .hidden to be skipped")
	}
}

func TestWriteTree_withIgnore(t *testing.T) {
	dir := t.TempDir()
	os.MkdirAll(filepath.Join(dir, "node_modules/pkg"), 0755)
	os.WriteFile(filepath.Join(dir, "main.go"), []byte("package main"), 0644)
	os.WriteFile(filepath.Join(dir, "node_modules", "pkg", "lib.go"), []byte("package pkg"), 0644)

	gi := &gitIgnore{dir: dir, rules: []gitIgnoreRule{{pattern: "node_modules"}}}

	var buf bytes.Buffer
	dirs, files, err := writeTree(&buf, dir, dir, "", gi, nil, nil)
	if err != nil {
		t.Fatal(err)
	}
	if dirs != 0 {
		t.Errorf("expected 0 dirs, got %d", dirs)
	}
	if files != 1 {
		t.Errorf("expected 1 file, got %d", files)
	}
	if !strings.Contains(buf.String(), "main.go") {
		t.Error("expected main.go in output")
	}
	if strings.Contains(buf.String(), "node_modules") {
		t.Error("expected node_modules to be ignored")
	}
}

func TestWriteTree_ignoreDirByName(t *testing.T) {
	dir := t.TempDir()
	os.MkdirAll(filepath.Join(dir, "dist"), 0755)
	os.WriteFile(filepath.Join(dir, "dist", "bundle.js"), []byte(""), 0644)
	os.WriteFile(filepath.Join(dir, "main.go"), []byte("package main"), 0644)

	var buf bytes.Buffer
	_, files, err := writeTree(&buf, dir, dir, "", nil, map[string]bool{"dist": true}, nil)
	if err != nil {
		t.Fatal(err)
	}
	if files != 1 {
		t.Errorf("expected 1 file, got %d", files)
	}
}

func TestWriteTree_ignoreFileByName(t *testing.T) {
	dir := t.TempDir()
	os.WriteFile(filepath.Join(dir, "main.go"), []byte("package main"), 0644)
	os.WriteFile(filepath.Join(dir, "README.md"), []byte("# readme"), 0644)

	var buf bytes.Buffer
	_, files, err := writeTree(&buf, dir, dir, "", nil, nil, map[string]bool{"README.md": true})
	if err != nil {
		t.Fatal(err)
	}
	if files != 1 {
		t.Errorf("expected 1 file, got %d", files)
	}
	if !strings.Contains(buf.String(), "main.go") {
		t.Error("expected main.go in output")
	}
	if strings.Contains(buf.String(), "README.md") {
		t.Error("expected README.md to be ignored")
	}
}

func TestWriteTree_readDirError(t *testing.T) {
	var buf bytes.Buffer
	_, _, err := writeTree(&buf, "/nonexistent-test-path", "/nonexistent-test-path", "", nil, nil, nil)
	if err == nil {
		t.Error("expected error for nonexistent directory")
	}
}

func TestWriteTree_nestedIgnores(t *testing.T) {
	dir := t.TempDir()
	os.MkdirAll(filepath.Join(dir, "src"), 0755)
	os.WriteFile(filepath.Join(dir, "src", "main.go"), []byte("package main"), 0644)
	os.WriteFile(filepath.Join(dir, "src", ".gitignore"), []byte("*.log"), 0644)
	os.WriteFile(filepath.Join(dir, "src", "debug.log"), []byte("log"), 0644)

	parentGI := &gitIgnore{dir: dir, rules: []gitIgnoreRule{{pattern: "node_modules"}}}

	var buf bytes.Buffer
	_, files, err := writeTree(&buf, dir, dir, "", parentGI, nil, nil)
	if err != nil {
		t.Fatal(err)
	}
	if files != 1 {
		t.Errorf("expected 1 file (main.go), got %d", files)
	}
}

func TestRunTree_Error(t *testing.T) {
	err := runTree("/nonexistent-test-path", filepath.Join(t.TempDir(), "tree.md"), nil, nil)
	if err == nil {
		t.Error("expected error for nonexistent directory")
	}
}

func TestRunTree_BadOutput(t *testing.T) {
	err := runTree(".", "/nonexistent-test-path/deep/tree.md", nil, nil)
	if err == nil {
		t.Error("expected error for bad output path")
	}
}

func TestLoadGitignore_scannerError(t *testing.T) {
	dir := t.TempDir()
	gi := filepath.Join(dir, ".gitignore")
	if err := os.WriteFile(gi, []byte("valid\n\x00invalid"), 0644); err != nil {
		t.Fatal(err)
	}
	_, err := loadGitignore(dir)
	if err != nil {
		t.Logf("scanner error (acceptable): %v", err)
	}
}

func TestGitIgnore_ignore_nil(t *testing.T) {
	var gi *gitIgnore
	if gi.ignore("anything", false) {
		t.Error("nil gitIgnore should not ignore anything")
	}
}

func TestGitIgnore_ignore_withRelPathError(t *testing.T) {
	gi := &gitIgnore{dir: "/root", rules: []gitIgnoreRule{{pattern: "foo"}}}
	result := gi.ignore("/different/root/file.go", false)
	_ = result
}

func TestWriteTree_withGitignore(t *testing.T) {
	dir := t.TempDir()
	os.WriteFile(filepath.Join(dir, ".gitignore"), []byte("*.log\nnode_modules/\n"), 0644)
	os.MkdirAll(filepath.Join(dir, "node_modules"), 0755)
	os.WriteFile(filepath.Join(dir, "node_modules", "pkg.js"), []byte(""), 0644)
	os.WriteFile(filepath.Join(dir, "main.go"), []byte("package main"), 0644)
	os.WriteFile(filepath.Join(dir, "debug.log"), []byte("log"), 0644)

	gi, err := loadGitignore(dir)
	if err != nil {
		t.Fatal(err)
	}

	var buf bytes.Buffer
	dirs, files, err := writeTree(&buf, dir, dir, "", gi, nil, nil)
	if err != nil {
		t.Fatal(err)
	}
	if files != 1 {
		t.Errorf("expected 1 file (main.go), got %d", files)
	}
	if dirs != 0 {
		t.Errorf("expected 0 dirs, got %d", dirs)
	}
}

func TestMatchAnySegment_noMatch(t *testing.T) {
	if matchAnySegment("nonexistent", "a/b/c") {
		t.Error("expected no match")
	}
}

func TestMatchAnySegment_rootMatch(t *testing.T) {
	if !matchAnySegment("dist", "dist") {
		t.Error("expected match for exact path")
	}
}
