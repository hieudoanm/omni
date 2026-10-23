package edit

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestPerformEditPlainText(t *testing.T) {
	result, count, err := performEdit("foo bar foo", "foo", "baz", false, 0)
	if err != nil {
		t.Fatal(err)
	}
	if result != "baz bar baz" {
		t.Errorf("got %q, want %q", result, "baz bar baz")
	}
	if count != 2 {
		t.Errorf("count = %d, want 2", count)
	}
}

func TestPerformEditPlainTextCount(t *testing.T) {
	result, count, err := performEdit("foo foo foo", "foo", "bar", false, 2)
	if err != nil {
		t.Fatal(err)
	}
	if result != "bar bar foo" {
		t.Errorf("got %q, want %q", result, "bar bar foo")
	}
	if count != 2 {
		t.Errorf("count = %d, want 2", count)
	}
}

func TestPerformEditNoMatch(t *testing.T) {
	result, count, err := performEdit("hello world", "xyz", "abc", false, 0)
	if err != nil {
		t.Fatal(err)
	}
	if result != "hello world" {
		t.Errorf("got %q, want %q", result, "hello world")
	}
	if count != 0 {
		t.Errorf("count = %d, want 0", count)
	}
}

func TestPerformEditRegex(t *testing.T) {
	result, count, err := performEdit("hello 123 world 456", `\d+`, "NUM", true, 0)
	if err != nil {
		t.Fatal(err)
	}
	if result != "hello NUM world NUM" {
		t.Errorf("got %q, want %q", result, "hello NUM world NUM")
	}
	if count != 2 {
		t.Errorf("count = %d, want 2", count)
	}
}

func TestPerformEditRegexCount(t *testing.T) {
	result, count, err := performEdit("a1 b2 c3", `\d`, "X", true, 2)
	if err != nil {
		t.Fatal(err)
	}
	if result != "aX bX c3" {
		t.Errorf("got %q, want %q", result, "aX bX c3")
	}
	if count != 2 {
		t.Errorf("count = %d, want 2", count)
	}
}

func TestPerformEditRegexNoMatch(t *testing.T) {
	result, count, err := performEdit("hello world", `\d+`, "NUM", true, 0)
	if err != nil {
		t.Fatal(err)
	}
	if result != "hello world" {
		t.Errorf("got %q, want %q", result, "hello world")
	}
	if count != 0 {
		t.Errorf("count = %d, want 0", count)
	}
}

func TestPerformEditInvalidRegex(t *testing.T) {
	_, _, err := performEdit("hello", "[invalid", "x", true, 0)
	if err == nil {
		t.Fatal("expected error for invalid regex")
	}
}

func TestPerformEditCountExceedsMatches(t *testing.T) {
	result, count, err := performEdit("foo foo", "foo", "bar", false, 10)
	if err != nil {
		t.Fatal(err)
	}
	if result != "bar bar" {
		t.Errorf("got %q, want %q", result, "bar bar")
	}
	if count != 2 {
		t.Errorf("count = %d, want 2", count)
	}
}

func TestPerformEditCountWithRegexExceeds(t *testing.T) {
	result, count, err := performEdit("a b c", `\w`, "x", true, 10)
	if err != nil {
		t.Fatal(err)
	}
	if result != "x x x" {
		t.Errorf("got %q, want %q", result, "x x x")
	}
	if count != 3 {
		t.Errorf("count = %d, want 3", count)
	}
}

func TestOutputEditResultNoMatchText(t *testing.T) {
	output := captureOutput(func() {
		err := outputEditResult("test.txt", "content", "content", 0, false, 0644, false)
		if err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "No matches found") {
		t.Errorf("expected no matches message, got: %s", output)
	}
}

func TestOutputEditResultNoMatchJSON(t *testing.T) {
	output := captureOutput(func() {
		err := outputEditResult("test.txt", "content", "content", 0, false, 0644, true)
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

func TestOutputEditResultPreviewText(t *testing.T) {
	output := captureOutput(func() {
		err := outputEditResult("test.txt", "hello foo", "hello bar", 1, true, 0644, false)
		if err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "Preview for") {
		t.Errorf("expected preview header, got: %s", output)
	}
	if !strings.Contains(output, "- hello foo") {
		t.Errorf("expected diff, got: %s", output)
	}
	if !strings.Contains(output, "+ hello bar") {
		t.Errorf("expected diff, got: %s", output)
	}
}

func TestOutputEditResultPreviewJSON(t *testing.T) {
	output := captureOutput(func() {
		err := outputEditResult("test.txt", "hello foo", "hello bar", 1, true, 0644, true)
		if err != nil {
			t.Fatal(err)
		}
	})
	var result map[string]interface{}
	if err := json.Unmarshal([]byte(output), &result); err != nil {
		t.Fatalf("invalid JSON: %v", err)
	}
	if result["matches"].(float64) != 1 {
		t.Errorf("matches = %v, want 1", result["matches"])
	}
	if result["diff"] == nil {
		t.Error("expected diff in JSON output")
	}
}

func TestOutputEditResultWriteText(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "output.txt")
	os.WriteFile(path, []byte("hello foo"), 0644)

	output := captureOutput(func() {
		err := outputEditResult(path, "hello foo", "hello bar", 1, false, 0644, false)
		if err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "Replaced 1 occurrence") {
		t.Errorf("expected replacement message, got: %s", output)
	}
	data, _ := os.ReadFile(path)
	if string(data) != "hello bar" {
		t.Errorf("file content = %q, want %q", string(data), "hello bar")
	}
}

func TestOutputEditResultWriteJSON(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "output.json")
	os.WriteFile(path, []byte("hello foo"), 0644)

	output := captureOutput(func() {
		err := outputEditResult(path, "hello foo", "hello bar", 1, false, 0644, true)
		if err != nil {
			t.Fatal(err)
		}
	})
	var result map[string]interface{}
	if err := json.Unmarshal([]byte(output), &result); err != nil {
		t.Fatalf("invalid JSON: %v", err)
	}
	if result["matches"].(float64) != 1 {
		t.Errorf("matches = %v, want 1", result["matches"])
	}
	if result["file"] != path {
		t.Errorf("file = %v, want %q", result["file"], path)
	}
}

func TestOutputEditResultPlural(t *testing.T) {
	output := captureOutput(func() {
		err := outputEditResult("test.txt", "content", "replaced", 2, false, 0644, false)
		if err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "occurrences") {
		t.Errorf("expected plural 'occurrences', got: %s", output)
	}
}

func TestPerformEditRegexCountLessThanTotal(t *testing.T) {
	result, count, err := performEdit("a1 b2 c3 d4", `\d`, "X", true, 2)
	if err != nil {
		t.Fatal(err)
	}
	if result != "aX bX c3 d4" {
		t.Errorf("got %q, want %q", result, "aX bX c3 d4")
	}
	if count != 2 {
		t.Errorf("count = %d, want 2", count)
	}
}
