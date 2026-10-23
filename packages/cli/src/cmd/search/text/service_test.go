package text

import (
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/search/shared"
)

func TestTextCmdRun(t *testing.T) {
	dir := t.TempDir()
	os.WriteFile(filepath.Join(dir, "test.txt"), []byte("hello world\nfoo bar"), 0644)

	re := regexp.MustCompile("hello")
	results, err := searchTextInRoots("hello", []string{dir}, re, nil, 0, 0)
	if err != nil {
		t.Fatal(err)
	}

	if len(results) != 1 {
		t.Fatalf("expected 1 result, got %d", len(results))
	}
}

func TestTextCmdRunInvalidRegex(t *testing.T) {
	_, err := regexp.Compile("[invalid")
	if err == nil {
		t.Fatal("expected error for invalid regex")
	}
}

func TestTextCmdRunJSON(t *testing.T) {
	results := []textMatch{
		{File: "test.txt", Line: 1, Content: "hello world"},
	}
	output := shared.CaptureOutput(func() {
		if err := outputTextResults(results, "hello", true); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, `"pattern"`) {
		t.Errorf("expected JSON output, got: %s", output)
	}
}

func TestSearchFileText(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "test.txt")
	content := "hello world\nfoo bar\nhello again"
	os.WriteFile(path, []byte(content), 0644)

	re := regexp.MustCompile("hello")
	matches := searchFileText(path, "hello", re, 0)
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

func TestSearchFileTextMaxCount(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "test.txt")
	content := "match\nskip\nmatch\nskip\nmatch"
	os.WriteFile(path, []byte(content), 0644)

	re := regexp.MustCompile("match")
	matches := searchFileText(path, "match", re, 2)
	if len(matches) != 2 {
		t.Errorf("got %d matches, want 2", len(matches))
	}
}

func TestSearchFileTextNoMatch(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "test.txt")
	os.WriteFile(path, []byte("hello world"), 0644)

	re := regexp.MustCompile("nonexistent")
	matches := searchFileText(path, "nonexistent", re, 0)
	if len(matches) != 0 {
		t.Errorf("got %d matches, want 0", len(matches))
	}
}

func TestSearchFileTextBinary(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "binary.bin")
	os.WriteFile(path, []byte{0x00, 0x01, 0x02}, 0644)

	re := regexp.MustCompile(".")
	matches := searchFileText(path, ".", re, 0)
	if len(matches) != 0 {
		t.Errorf("expected 0 matches for binary, got %d", len(matches))
	}
}

func TestSearchFileTextMissingFile(t *testing.T) {
	re := regexp.MustCompile(".")
	matches := searchFileText("/nonexistent/file.txt", ".", re, 0)
	if matches != nil {
		t.Errorf("expected nil, got %v", matches)
	}
}

func TestIncludeToRegexEmpty(t *testing.T) {
	re := includeToRegex("")
	if re != nil {
		t.Error("expected nil for empty include")
	}
}

func TestIncludeToRegexGlob(t *testing.T) {
	re := includeToRegex("*.go")
	if re == nil {
		t.Fatal("expected non-nil regex")
	}
	if !re.MatchString("main.go") {
		t.Error("expected *.go to match main.go")
	}
	if re.MatchString("main.ts") {
		t.Error("expected *.go to NOT match main.ts")
	}
}

func TestIncludeToRegexExact(t *testing.T) {
	re := includeToRegex("main.go")
	if re == nil {
		t.Fatal("expected non-nil regex")
	}
	if !re.MatchString("main.go") {
		t.Error("expected exact match for main.go")
	}
	if re.MatchString("lib/main.go") {
		t.Error("expected no match for path with directory")
	}
}

func TestOutputTextResultsText(t *testing.T) {
	results := []textMatch{
		{File: "test.txt", Line: 1, Content: "hello world"},
	}
	output := shared.CaptureOutput(func() {
		if err := outputTextResults(results, "hello", false); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "hello world") {
		t.Errorf("expected content in output, got: %s", output)
	}
	if !strings.Contains(output, "test.txt") {
		t.Errorf("expected filename in output, got: %s", output)
	}
}

func TestOutputTextResultsJSON(t *testing.T) {
	results := []textMatch{
		{File: "test.txt", Line: 1, Content: "hello"},
	}
	output := shared.CaptureOutput(func() {
		if err := outputTextResults(results, "hello", true); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, `"pattern": "hello"`) {
		t.Errorf("expected pattern in JSON, got: %s", output)
	}
	if !strings.Contains(output, `"matches": 1`) {
		t.Errorf("expected matches count, got: %s", output)
	}
}

func TestOutputTextResultsMultiple(t *testing.T) {
	results := []textMatch{
		{File: "a.txt", Line: 1, Content: "hello"},
		{File: "b.txt", Line: 1, Content: "world"},
	}
	output := shared.CaptureOutput(func() {
		if err := outputTextResults(results, "test", false); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "2 matches") {
		t.Errorf("expected count in output, got: %s", output)
	}
}

func TestOutputTextResultsEmpty(t *testing.T) {
	output := shared.CaptureOutput(func() {
		if err := outputTextResults(nil, "hello", false); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "no matches") {
		t.Errorf("expected 'no matches', got: %s", output)
	}
}

func TestSearchTextInRootsFile(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "test.txt")
	os.WriteFile(path, []byte("hello world\nfoo bar"), 0644)

	re := regexp.MustCompile("hello")
	results, err := searchTextInRoots("hello", []string{path}, re, nil, 0, 0)
	if err != nil {
		t.Fatal(err)
	}
	if len(results) != 1 {
		t.Fatalf("expected 1 result, got %d", len(results))
	}
	if results[0].Line != 1 {
		t.Errorf("expected line 1, got %d", results[0].Line)
	}
}

func TestSearchTextInRootsDirectory(t *testing.T) {
	dir := t.TempDir()
	os.WriteFile(filepath.Join(dir, "a.txt"), []byte("hello world"), 0644)
	os.WriteFile(filepath.Join(dir, "b.txt"), []byte("foo bar"), 0644)

	re := regexp.MustCompile("hello")
	results, err := searchTextInRoots("hello", []string{dir}, re, nil, 0, 0)
	if err != nil {
		t.Fatal(err)
	}
	if len(results) != 1 {
		t.Fatalf("expected 1 result, got %d", len(results))
	}
}

func TestSearchTextInRootsStatError(t *testing.T) {
	re := regexp.MustCompile("hello")
	results, err := searchTextInRoots("hello", []string{"/nonexistent"}, re, nil, 0, 0)
	if err != nil {
		t.Fatal(err)
	}
	if len(results) != 0 {
		t.Errorf("expected 0 results, got %d", len(results))
	}
}

func TestSearchTextInRootsFileDedup(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "test.txt")
	os.WriteFile(path, []byte("hello world"), 0644)

	re := regexp.MustCompile("hello")
	results, err := searchTextInRoots("hello", []string{path, path}, re, nil, 0, 0)
	if err != nil {
		t.Fatal(err)
	}
	if len(results) != 1 {
		t.Errorf("expected 1 deduped result, got %d", len(results))
	}
}

func TestSearchTextInRootsMaxCount(t *testing.T) {
	dir := t.TempDir()
	for i := 0; i < 5; i++ {
		os.WriteFile(filepath.Join(dir, "f.txt"), []byte("match"), 0644)
	}

	re := regexp.MustCompile("match")
	results, err := searchTextInRoots("match", []string{dir}, re, nil, 0, 2)
	if err != nil {
		t.Fatal(err)
	}
	if len(results) > 2 {
		t.Errorf("expected at most 2 results, got %d", len(results))
	}
}
