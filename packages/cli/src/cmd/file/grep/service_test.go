package grep

import (
	"encoding/json"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"testing"
)

func TestCompileSearchPatternPlain(t *testing.T) {
	re, err := compileSearchPattern("hello", false, false)
	if err != nil {
		t.Fatal(err)
	}
	if !re.MatchString("hello") {
		t.Error("expected match")
	}
}

func TestCompileSearchPatternFixed(t *testing.T) {
	re, err := compileSearchPattern("hello.", true, false)
	if err != nil {
		t.Fatal(err)
	}
	if !re.MatchString("hello.") {
		t.Error("fixed string should match literal dot")
	}
	if re.MatchString("helloX") {
		t.Error("fixed string should not treat dot as any char")
	}
}

func TestCompileSearchPatternIgnoreCase(t *testing.T) {
	re, err := compileSearchPattern("hello", false, true)
	if err != nil {
		t.Fatal(err)
	}
	if !re.MatchString("HELLO") {
		t.Error("expected case-insensitive match")
	}
	if !re.MatchString("hello") {
		t.Error("expected match")
	}
}

func TestCompileSearchPatternInvalid(t *testing.T) {
	_, err := compileSearchPattern("[invalid", false, false)
	if err == nil {
		t.Fatal("expected error for invalid regex")
	}
}

func TestCompileSearchPatternEmpty(t *testing.T) {
	re, err := compileSearchPattern("", false, false)
	if err != nil {
		t.Fatal(err)
	}
	if re == nil {
		t.Fatal("expected non-nil regex")
	}
}

func TestCompileSearchPatternFixedAndIgnoreCase(t *testing.T) {
	re, err := compileSearchPattern("HELLO", true, true)
	if err != nil {
		t.Fatal(err)
	}
	if !re.MatchString("HELLO") {
		t.Error("expected match for exactly HELLO")
	}
}

func TestCompileIncludePattern(t *testing.T) {
	re := compileIncludePattern("*.go")
	if re == nil {
		t.Fatal("expected non-nil pattern")
	}
	if !re.MatchString("main.go") {
		t.Error("expected match for main.go")
	}
	if re.MatchString("main.ts") {
		t.Error("expected no match for main.ts")
	}
}

func TestCompileIncludePatternEmpty(t *testing.T) {
	re := compileIncludePattern("")
	if re != nil {
		t.Error("expected nil for empty pattern")
	}
}

func TestCompileIncludePatternComplex(t *testing.T) {
	re := compileIncludePattern("test_*.txt")
	if re == nil {
		t.Fatal("expected non-nil pattern")
	}
	if !re.MatchString("test_foo.txt") {
		t.Error("expected match for test_foo.txt")
	}
	if re.MatchString("test_foo.md") {
		t.Error("expected no match for test_foo.md")
	}
}

func TestGrepFile(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "test.txt")
	os.WriteFile(path, []byte("hello\nworld\n"), 0644)

	re := regexp.MustCompile("hello")
	matches, files := grepFile(re, path, 0, 0)
	if files != 1 {
		t.Errorf("files = %d, want 1", files)
	}
	if len(matches) != 1 {
		t.Fatalf("matches = %d, want 1", len(matches))
	}
	if matches[0].File != path {
		t.Errorf("file = %q, want %q", matches[0].File, path)
	}
	if matches[0].Line != 1 {
		t.Errorf("line = %d, want 1", matches[0].Line)
	}
}

func TestGrepFileNoMatch(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "test.txt")
	os.WriteFile(path, []byte("hello\nworld\n"), 0644)

	re := regexp.MustCompile("nonexistent")
	matches, files := grepFile(re, path, 0, 0)
	if files != 1 {
		t.Errorf("files = %d, want 1", files)
	}
	if len(matches) != 0 {
		t.Errorf("matches = %d, want 0", len(matches))
	}
}

func TestGrepFileNonExistent(t *testing.T) {
	re := regexp.MustCompile("hello")
	matches, files := grepFile(re, "/nonexistent/path/file.txt", 0, 0)
	if files != 0 {
		t.Errorf("files = %d, want 0", files)
	}
	if len(matches) != 0 {
		t.Errorf("matches = %d, want 0", len(matches))
	}
}

func TestGrepFileMaxCount(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "test.txt")
	os.WriteFile(path, []byte("match\nskip\nmatch\nskip\nmatch\n"), 0644)

	re := regexp.MustCompile("match")
	matches, files := grepFile(re, path, 0, 2)
	if files != 1 {
		t.Errorf("files = %d, want 1", files)
	}
	if len(matches) != 2 {
		t.Errorf("matches = %d, want 2", len(matches))
	}
}

func TestGrepFilesSingleFile(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "test.txt")
	os.WriteFile(path, []byte("hello\nworld\n"), 0644)

	re := regexp.MustCompile("hello")
	matches, totalFiles := grepFiles(re, []string{path}, nil, 0, 0)
	if totalFiles != 1 {
		t.Errorf("totalFiles = %d, want 1", totalFiles)
	}
	if len(matches) != 1 {
		t.Errorf("matches = %d, want 1", len(matches))
	}
}

func TestGrepFilesDirectory(t *testing.T) {
	dir := t.TempDir()
	os.WriteFile(filepath.Join(dir, "a.go"), []byte("package main\n"), 0644)
	os.WriteFile(filepath.Join(dir, "b.rs"), []byte("fn main() {}\n"), 0644)

	re := regexp.MustCompile("main")
	matches, totalFiles := grepFiles(re, []string{dir}, regexp.MustCompile(globToRegex("*.go")), 0, 0)
	if totalFiles != 1 {
		t.Errorf("totalFiles = %d, want 1", totalFiles)
	}
	if len(matches) != 1 {
		t.Errorf("matches = %d, want 1", len(matches))
	}
}

func TestGrepFilesBinarySkipped(t *testing.T) {
	dir := t.TempDir()
	os.WriteFile(filepath.Join(dir, "file.exe"), []byte("binary content"), 0644)

	re := regexp.MustCompile("binary")
	matches, totalFiles := grepFiles(re, []string{dir}, nil, 0, 0)
	if totalFiles != 0 {
		t.Errorf("totalFiles = %d, want 0", totalFiles)
	}
	if len(matches) != 0 {
		t.Errorf("matches = %d, want 0", len(matches))
	}
}

func TestGrepFilesNoMatch(t *testing.T) {
	dir := t.TempDir()
	os.WriteFile(filepath.Join(dir, "test.txt"), []byte("hello\n"), 0644)

	re := regexp.MustCompile("nonexistent")
	matches, totalFiles := grepFiles(re, []string{dir}, nil, 0, 0)
	if totalFiles != 1 {
		t.Errorf("totalFiles = %d, want 1", totalFiles)
	}
	if len(matches) != 0 {
		t.Errorf("matches = %d, want 0", len(matches))
	}
}

func TestGrepFilesNonExistentPath(t *testing.T) {
	re := regexp.MustCompile("hello")
	matches, totalFiles := grepFiles(re, []string{"/nonexistent/123xyz"}, nil, 0, 0)
	if totalFiles != 0 {
		t.Errorf("totalFiles = %d, want 0", totalFiles)
	}
	if len(matches) != 0 {
		t.Errorf("matches = %d, want 0", len(matches))
	}
}

func TestOutputGrepResultsText(t *testing.T) {
	matches := []lineMatch{
		{File: "test.txt", Line: 1, Content: "hello"},
	}
	output := captureOutput(func() {
		err := outputGrepResults(matches, 1, "hello", false)
		if err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "hello") {
		t.Errorf("expected match in output, got: %s", output)
	}
}

func TestOutputGrepResultsNoMatches(t *testing.T) {
	output := captureOutput(func() {
		err := outputGrepResults([]lineMatch{}, 0, "hello", false)
		if err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "(no matches)") {
		t.Errorf("expected no matches message, got: %s", output)
	}
}

func TestOutputGrepResultsJSON(t *testing.T) {
	matches := []lineMatch{
		{File: "test.txt", Line: 1, Content: "hello"},
	}
	output := captureOutput(func() {
		err := outputGrepResults(matches, 1, "hello", true)
		if err != nil {
			t.Fatal(err)
		}
	})
	var result map[string]interface{}
	if err := json.Unmarshal([]byte(output), &result); err != nil {
		t.Fatalf("invalid JSON: %v", err)
	}
	if result["pattern"] != "hello" {
		t.Errorf("pattern = %v, want %q", result["pattern"], "hello")
	}
	if result["matches"].(float64) != 1 {
		t.Errorf("matches = %v, want 1", result["matches"])
	}
	if result["files"].(float64) != 1 {
		t.Errorf("files = %v, want 1", result["files"])
	}
}

func TestOutputGrepResultsJSONNoMatches(t *testing.T) {
	output := captureOutput(func() {
		err := outputGrepResults([]lineMatch{}, 0, "hello", true)
		if err != nil {
			t.Fatal(err)
		}
	})
	var result map[string]interface{}
	if err := json.Unmarshal([]byte(output), &result); err != nil {
		t.Fatalf("invalid JSON: %v", err)
	}
	if result["matches"].(float64) != 0 {
		t.Errorf("matches = %v, want 0", result["matches"])
	}
}

func TestOutputGrepResultsMultiFile(t *testing.T) {
	matches := []lineMatch{
		{File: "a.txt", Line: 1, Content: "match"},
		{File: "b.txt", Line: 3, Content: "match"},
	}
	output := captureOutput(func() {
		err := outputGrepResults(matches, 2, "match", false)
		if err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "a.txt:") {
		t.Errorf("expected file prefix, got: %s", output)
	}
	if !strings.Contains(output, "b.txt:") {
		t.Errorf("expected file prefix, got: %s", output)
	}
}

func TestOutputGrepResultsWithContext(t *testing.T) {
	matches := []lineMatch{
		{
			File:    "test.txt",
			Line:    3,
			Content: "match",
			Before:  "  line 2 context",
			After:   "  full context block",
		},
	}
	output := captureOutput(func() {
		err := outputGrepResults(matches, 1, "match", false)
		if err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "context") {
		t.Errorf("expected context in output, got: %s", output)
	}
}
