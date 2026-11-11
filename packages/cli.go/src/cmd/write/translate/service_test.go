package translate

import (
	"os"
	"path/filepath"
	"testing"
)

func TestReadInput_FromArgs(t *testing.T) {
	result, err := readInput([]string{"hello"}, "")
	if err != nil {
		t.Fatal(err)
	}
	if result != "hello" {
		t.Errorf("got %q, want %q", result, "hello")
	}
}

func TestReadInput_FromFile(t *testing.T) {
	tmpDir := t.TempDir()
	path := filepath.Join(tmpDir, "input.txt")
	if err := os.WriteFile(path, []byte("text"), 0644); err != nil {
		t.Fatal(err)
	}

	result, err := readInput(nil, path)
	if err != nil {
		t.Fatal(err)
	}
	if result != "text" {
		t.Errorf("got %q, want %q", result, "text")
	}
}

func TestReadInput_FileNotFound(t *testing.T) {
	_, err := readInput(nil, "/nonexistent.txt")
	if err == nil {
		t.Fatal("expected error for nonexistent file")
	}
}
