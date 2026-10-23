package summarize

import (
	"os"
	"path/filepath"
	"testing"
)

func TestReadInput_FromArgs(t *testing.T) {
	result, err := readInput([]string{"hello world"}, "")
	if err != nil {
		t.Fatal(err)
	}
	if result != "hello world" {
		t.Errorf("got %q, want %q", result, "hello world")
	}
}

func TestReadInput_FromFile(t *testing.T) {
	tmpDir := t.TempDir()
	path := filepath.Join(tmpDir, "input.txt")
	if err := os.WriteFile(path, []byte("file content"), 0644); err != nil {
		t.Fatal(err)
	}

	result, err := readInput(nil, path)
	if err != nil {
		t.Fatal(err)
	}
	if result != "file content" {
		t.Errorf("got %q, want %q", result, "file content")
	}
}

func TestReadInput_FileNotFound(t *testing.T) {
	_, err := readInput(nil, "/nonexistent.txt")
	if err == nil {
		t.Fatal("expected error for nonexistent file")
	}
}

func TestReadInput_NoInput(t *testing.T) {
	result, err := readInput(nil, "")
	if err != nil {
		t.Fatal(err)
	}
	if result != "" {
		t.Errorf("expected empty string, got %q", result)
	}
}
