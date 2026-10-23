package grep

import (
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"testing"
)

func TestGlobToRegex(t *testing.T) {
	tests := []struct {
		pattern string
		input   string
		want    bool
	}{
		{"*.go", "main.go", true},
		{"*.go", "main.ts", false},
		{"*.go", ".go", true},
		{"test_*.txt", "test_foo.txt", true},
		{"test_*.txt", "foo_test.txt", false},
		{"foo.?", "foo.x", true},
		{"foo.?", "foo.xy", false},
		{"foo.bar", "foo.bar", true},
		{"foo.bar", "foo.baz", false},
	}
	for _, tc := range tests {
		re := regexp.MustCompile(globToRegex(tc.pattern))
		got := re.MatchString(tc.input)
		if got != tc.want {
			t.Errorf("globToRegex(%q).MatchString(%q) = %v, want %v", tc.pattern, tc.input, got, tc.want)
		}
	}
}

func TestIsBinary(t *testing.T) {
	tests := []struct {
		path string
		want bool
	}{
		{"file.exe", true},
		{"file.jpg", true},
		{"file.jpeg", true},
		{"file.png", true},
		{"file.gif", true},
		{"file.pdf", true},
		{"file.zip", true},
		{"file.go", false},
		{"file.txt", false},
		{"file.md", false},
		{"file.py", false},
		{"Makefile", false},
		{"file.unknown", false},
	}
	for _, tc := range tests {
		got := isBinary(tc.path)
		if got != tc.want {
			t.Errorf("isBinary(%q) = %v, want %v", tc.path, got, tc.want)
		}
	}
}

func TestSearchFile(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "search.txt")
	content := "hello world\nfoo bar\nhello again\nbaz qux"
	os.WriteFile(path, []byte(content), 0644)

	re := regexp.MustCompile("hello")
	matches, err := searchFile(re, path, 0, 0)
	if err != nil {
		t.Fatal(err)
	}
	if len(matches) != 2 {
		t.Errorf("got %d matches, want 2", len(matches))
	}
	if len(matches) > 0 && matches[0].Line != 1 {
		t.Errorf("first match line = %d, want 1", matches[0].Line)
	}
	if len(matches) > 1 && matches[1].Line != 3 {
		t.Errorf("second match line = %d, want 3", matches[1].Line)
	}
}

func TestSearchFileMaxCount(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "search_max.txt")
	content := "match\nskip\nmatch\nskip\nmatch"
	os.WriteFile(path, []byte(content), 0644)

	re := regexp.MustCompile("match")
	matches, err := searchFile(re, path, 0, 2)
	if err != nil {
		t.Fatal(err)
	}
	if len(matches) != 2 {
		t.Errorf("got %d matches, want 2", len(matches))
	}
}

func TestSearchFileNoMatch(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "search_none.txt")
	os.WriteFile(path, []byte("hello world"), 0644)

	re := regexp.MustCompile("nonexistent")
	matches, err := searchFile(re, path, 0, 0)
	if err != nil {
		t.Fatal(err)
	}
	if len(matches) != 0 {
		t.Errorf("got %d matches, want 0", len(matches))
	}
}

func TestSearchFileBinarySkipped(t *testing.T) {
	if !isBinary("test.exe") {
		t.Error("expected .exe to be binary")
	}
}

func TestSearchFileContext(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "search_ctx.txt")
	content := "line1\nline2\nMATCH\nline4\nline5"
	os.WriteFile(path, []byte(content), 0644)

	re := regexp.MustCompile("MATCH")
	matches, err := searchFile(re, path, 1, 0)
	if err != nil {
		t.Fatal(err)
	}
	if len(matches) != 1 {
		t.Fatalf("got %d matches, want 1", len(matches))
	}
	if matches[0].After == "" {
		t.Error("expected context in .After field")
	}
}

func TestSearchFileContextAtStart(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "search_start.txt")
	content := "MATCH\nline2\nline3"
	os.WriteFile(path, []byte(content), 0644)

	re := regexp.MustCompile("MATCH")
	matches, err := searchFile(re, path, 2, 0)
	if err != nil {
		t.Fatal(err)
	}
	if len(matches) != 1 {
		t.Fatalf("got %d matches, want 1", len(matches))
	}
	if !strings.Contains(matches[0].After, "line2") {
		t.Error("expected context after match")
	}
}

func TestSearchFileContextAtEnd(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "search_end.txt")
	content := "line1\nline2\nMATCH"
	os.WriteFile(path, []byte(content), 0644)

	re := regexp.MustCompile("MATCH")
	matches, err := searchFile(re, path, 2, 0)
	if err != nil {
		t.Fatal(err)
	}
	if len(matches) != 1 {
		t.Fatalf("got %d matches, want 1", len(matches))
	}
	if !strings.Contains(matches[0].Before, "line2") {
		t.Error("expected context before match")
	}
}
