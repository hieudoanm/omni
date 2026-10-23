package tocsv

import (
	"os"
	"path/filepath"
	"testing"
)

func TestRunE_FileNotFound(t *testing.T) {
	err := runE("/nonexistent.xlsx", "")
	if err == nil {
		t.Fatal("expected error for nonexistent file")
	}
}

func TestRunE_InvalidFile(t *testing.T) {
	tmpDir := t.TempDir()
	path := filepath.Join(tmpDir, "not.xlsx")
	os.WriteFile(path, []byte("not a zip file"), 0644)

	err := runE(path, "")
	if err == nil {
		t.Fatal("expected error for invalid xlsx")
	}
}
