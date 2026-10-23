package text

import (
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"testing"
)

func TestWalkTextFile(t *testing.T) {
	dir := t.TempDir()
	os.WriteFile(filepath.Join(dir, "a.txt"), []byte("hello world"), 0644)
	os.WriteFile(filepath.Join(dir, "b.txt"), []byte("goodbye world"), 0644)
	os.WriteFile(filepath.Join(dir, "c.go"), []byte("package go"), 0644)

	var results []textMatch
	seen := make(map[string]bool)
	re := regexp.MustCompile("hello")
	walkTextFile(re, dir, 0, nil, &results, 0, seen)

	if len(results) != 1 {
		t.Fatalf("expected 1 result, got %d", len(results))
	}
	if results[0].File != filepath.Join(dir, "a.txt") {
		t.Errorf("expected file a.txt, got %s", results[0].File)
	}
}

func TestWalkTextFileIncludeFilter(t *testing.T) {
	dir := t.TempDir()
	os.WriteFile(filepath.Join(dir, "a.txt"), []byte("hello"), 0644)
	os.WriteFile(filepath.Join(dir, "a.go"), []byte("hello"), 0644)

	include := regexp.MustCompile(`^.*\.go$`)
	var results []textMatch
	seen := make(map[string]bool)
	re := regexp.MustCompile("hello")
	walkTextFile(re, dir, 0, include, &results, 0, seen)

	if len(results) != 1 {
		t.Fatalf("expected 1 result, got %d", len(results))
	}
	if !stringsSuffix(results[0].File, ".go") {
		t.Errorf("expected .go file, got %s", results[0].File)
	}
}

func TestWalkTextFileMaxDepth(t *testing.T) {
	dir := t.TempDir()
	os.MkdirAll(filepath.Join(dir, "sub"), 0755)
	os.WriteFile(filepath.Join(dir, "root.txt"), []byte("match"), 0644)
	os.WriteFile(filepath.Join(dir, "sub", "deep.txt"), []byte("match"), 0644)

	var results []textMatch
	seen := make(map[string]bool)
	re := regexp.MustCompile("match")
	walkTextFile(re, dir, 0, nil, &results, 0, seen)

	if len(results) != 2 {
		t.Errorf("expected 2 results (no depth limit), got %d", len(results))
	}
}

func TestWalkTextFileMaxCount(t *testing.T) {
	dir := t.TempDir()
	for i := 0; i < 5; i++ {
		os.WriteFile(filepath.Join(dir, "f.txt"), []byte("match"), 0644)
	}

	var results []textMatch
	seen := make(map[string]bool)
	re := regexp.MustCompile("match")
	walkTextFile(re, dir, 0, nil, &results, 0, seen)
}

func TestWalkTextFileMaxCountPositive(t *testing.T) {
	dir := t.TempDir()
	for i := 0; i < 5; i++ {
		os.WriteFile(filepath.Join(dir, fmt.Sprintf("f%d.txt", i)), []byte("match"), 0644)
	}

	var results []textMatch
	seen := make(map[string]bool)
	re := regexp.MustCompile("match")
	walkTextFile(re, dir, 0, nil, &results, 2, seen)

	if len(results) > 2 {
		t.Errorf("expected at most 2 results, got %d", len(results))
	}
}

func TestWalkTextFileMaxDepthPositive(t *testing.T) {
	dir := t.TempDir()
	os.MkdirAll(filepath.Join(dir, "sub"), 0755)
	os.WriteFile(filepath.Join(dir, "root.txt"), []byte("match"), 0644)
	os.WriteFile(filepath.Join(dir, "sub", "deep.txt"), []byte("match"), 0644)

	var results []textMatch
	seen := make(map[string]bool)
	re := regexp.MustCompile("match")
	walkTextFile(re, dir, 1, nil, &results, 0, seen)

	if len(results) != 1 {
		t.Errorf("expected 1 result (depth=1), got %d", len(results))
	}
}

func TestWalkTextFileDedup(t *testing.T) {
	dir := t.TempDir()
	os.WriteFile(filepath.Join(dir, "a.txt"), []byte("hello\nhello"), 0644)

	var results []textMatch
	seen := make(map[string]bool)
	re := regexp.MustCompile("hello")
	walkTextFile(re, dir, 0, nil, &results, 0, seen)

	if len(results) != 1 {
		t.Errorf("expected 1 deduped result, got %d", len(results))
	}
}

func stringsSuffix(s, suffix string) bool {
	return len(s) >= len(suffix) && s[len(s)-len(suffix):] == suffix
}
