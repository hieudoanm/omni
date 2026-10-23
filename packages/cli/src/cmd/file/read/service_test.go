package read

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestReadFileContentFull(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "test.txt")
	content := "line1\nline2\nline3\nline4\nline5\n"
	os.WriteFile(path, []byte(content), 0644)

	allContent, displayLines, totalLines, err := readFileContent(path, 0, 0)
	if err != nil {
		t.Fatal(err)
	}
	if allContent != content {
		t.Errorf("content = %q, want %q", allContent, content)
	}
	if len(displayLines) != 6 {
		t.Errorf("got %d lines, want 6", len(displayLines))
	}
	if totalLines != 6 {
		t.Errorf("totalLines = %d, want 6", totalLines)
	}
}

func TestReadFileContentWithOffset(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "test.txt")
	content := "line1\nline2\nline3\nline4\nline5\n"
	os.WriteFile(path, []byte(content), 0644)

	_, displayLines, totalLines, err := readFileContent(path, 1, 3)
	if err != nil {
		t.Fatal(err)
	}
	if len(displayLines) != 3 {
		t.Errorf("got %d lines, want 3", len(displayLines))
	}
	if displayLines[0] != "line2" {
		t.Errorf("first = %q, want %q", displayLines[0], "line2")
	}
	if displayLines[2] != "line4" {
		t.Errorf("last = %q, want %q", displayLines[2], "line4")
	}
	if totalLines != 6 {
		t.Errorf("totalLines = %d, want 6", totalLines)
	}
}

func TestReadFileContentOffsetOutOfRange(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "test.txt")
	os.WriteFile(path, []byte("line1\nline2\n"), 0644)

	_, displayLines, totalLines, err := readFileContent(path, 10, 5)
	if err != nil {
		t.Fatal(err)
	}
	if len(displayLines) != 0 {
		t.Errorf("got %d lines, want 0", len(displayLines))
	}
	if totalLines != 3 {
		t.Errorf("totalLines = %d, want 3", totalLines)
	}
}

func TestReadFileContentNegativeOffset(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "test.txt")
	os.WriteFile(path, []byte("line1\nline2\n"), 0644)

	_, displayLines, totalLines, err := readFileContent(path, -5, 1)
	if err != nil {
		t.Fatal(err)
	}
	if len(displayLines) != 1 {
		t.Errorf("got %d lines, want 1", len(displayLines))
	}
	if displayLines[0] != "line1" {
		t.Errorf("first = %q, want %q", displayLines[0], "line1")
	}
	if totalLines != 3 {
		t.Errorf("totalLines = %d, want 3", totalLines)
	}
}

func TestReadFileContentExactOffset(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "test.txt")
	os.WriteFile(path, []byte("a\nb\nc\n"), 0644)

	_, displayLines, totalLines, err := readFileContent(path, 2, 5)
	if err != nil {
		t.Fatal(err)
	}
	if len(displayLines) != 2 {
		t.Errorf("got %d lines, want 2", len(displayLines))
	}
	if displayLines[0] != "c" {
		t.Errorf("first = %q, want %q", displayLines[0], "c")
	}
	if totalLines != 4 {
		t.Errorf("totalLines = %d, want 4", totalLines)
	}
}

func TestReadFileContentDirectoryError(t *testing.T) {
	dir := t.TempDir()
	_, _, _, err := readFileContent(dir, 0, 0)
	if err == nil {
		t.Fatal("expected error for directory")
	}
}

func TestReadFileContentNonExistent(t *testing.T) {
	_, _, _, err := readFileContent("/nonexistent/path", 0, 0)
	if err == nil {
		t.Fatal("expected error for non-existent file")
	}
}

func TestReadFileContentEmptyFile(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "empty.txt")
	os.WriteFile(path, []byte(""), 0644)

	content, displayLines, totalLines, err := readFileContent(path, 0, 0)
	if err != nil {
		t.Fatal(err)
	}
	if content != "" {
		t.Errorf("content = %q, want %q", content, "")
	}
	if len(displayLines) != 1 || displayLines[0] != "" {
		t.Errorf("expected one empty line, got %v", displayLines)
	}
	if totalLines != 1 {
		t.Errorf("totalLines = %d, want 1", totalLines)
	}
}

func TestRenderReadJSON(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "test.txt")
	os.WriteFile(path, []byte("hello\nworld\n"), 0644)

	info, _ := os.Stat(path)
	output := captureOutput(func() {
		err := renderReadJSON(path, info, "hello\nworld\n", []string{"hello", "world"}, 2, 0, 0)
		if err != nil {
			t.Fatal(err)
		}
	})
	var result map[string]interface{}
	if err := json.Unmarshal([]byte(output), &result); err != nil {
		t.Fatalf("invalid JSON: %v", err)
	}
	if result["file"] != path {
		t.Errorf("file = %v, want %q", result["file"], path)
	}
	if result["totalLines"].(float64) != 2 {
		t.Errorf("totalLines = %v, want 2", result["totalLines"])
	}
	if result["content"] != "hello\nworld\n" {
		t.Errorf("content = %v, want %q", result["content"], "hello\nworld\n")
	}
}

func TestRenderReadJSONWithOffset(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "test.txt")
	os.WriteFile(path, []byte("line1\nline2\nline3\n"), 0644)

	info, _ := os.Stat(path)
	output := captureOutput(func() {
		err := renderReadJSON(path, info, "line1\nline2\nline3\n", []string{"line2"}, 3, 1, 1)
		if err != nil {
			t.Fatal(err)
		}
	})
	var result map[string]interface{}
	if err := json.Unmarshal([]byte(output), &result); err != nil {
		t.Fatalf("invalid JSON: %v", err)
	}
	if result["content"] != "line2" {
		t.Errorf("content = %v, want %q", result["content"], "line2")
	}
}

func TestRenderReadJSONIncludesMIME(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "test.go")
	os.WriteFile(path, []byte("package main\n"), 0644)

	info, _ := os.Stat(path)
	output := captureOutput(func() {
		err := renderReadJSON(path, info, "package main\n", []string{"package main"}, 1, 0, 0)
		if err != nil {
			t.Fatal(err)
		}
	})
	var result map[string]interface{}
	if err := json.Unmarshal([]byte(output), &result); err != nil {
		t.Fatalf("invalid JSON: %v", err)
	}
	if result["mime"] != "text/x-go" {
		t.Errorf("mime = %v, want %q", result["mime"], "text/x-go")
	}
}

func TestRenderReadText(t *testing.T) {
	output := captureOutput(func() {
		renderReadText("/tmp/test.txt", []string{"hello", "world"}, 0, 2, false)
	})
	if !strings.Contains(output, "hello") {
		t.Errorf("expected hello in output, got: %s", output)
	}
	if !strings.Contains(output, "world") {
		t.Errorf("expected world in output, got: %s", output)
	}
}

func TestRenderReadTextEmptyFile(t *testing.T) {
	output := captureOutput(func() {
		renderReadText("/tmp/test.txt", []string{}, 0, 0, false)
	})
	if !strings.Contains(output, "(empty file)") {
		t.Errorf("expected empty file message, got: %s", output)
	}
}

func TestRenderReadTextWithLineNumbers(t *testing.T) {
	output := captureOutput(func() {
		renderReadText("/tmp/test.txt", []string{"hello", "world"}, 0, 2, true)
	})
	if !strings.Contains(output, "1 | hello") {
		t.Errorf("expected line numbers, got: %s", output)
	}
	if !strings.Contains(output, "2 | world") {
		t.Errorf("expected line numbers, got: %s", output)
	}
}

func TestRenderReadTextTruncated(t *testing.T) {
	output := captureOutput(func() {
		renderReadText("/tmp/test.txt", []string{"middle"}, 1, 5, false)
	})
	if !strings.Contains(output, "1/5") {
		t.Errorf("expected summary, got: %s", output)
	}
}

func TestRenderReadTextFullFile(t *testing.T) {
	output := captureOutput(func() {
		renderReadText("/tmp/test.txt", []string{"a", "b", "c"}, 0, 3, false)
	})
	if strings.Contains(output, "3/3") {
		t.Errorf("unexpected summary for full file: %s", output)
	}
}

func TestRenderReadTextWithAbsPath(t *testing.T) {
	output := captureOutput(func() {
		renderReadText("/tmp/test.txt", []string{"hello"}, 0, 1, false)
	})
	if !strings.Contains(output, "/tmp/test.txt") {
		t.Errorf("expected path in output, got: %s", output)
	}
}
