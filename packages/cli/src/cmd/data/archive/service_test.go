package archive

import (
	"os"
	"path/filepath"
	"testing"
)

func TestRunE_CreateNoFiles(t *testing.T) {
	err := runE(nil, "create", "")
	if err == nil {
		t.Fatal("expected error for no files")
	}
}

func TestRunE_ExtractInvalidAction(t *testing.T) {
	err := runE([]string{"file.txt"}, "invalid", "")
	if err == nil {
		t.Fatal("expected error for invalid action")
	}
}

func TestRunE_ExtractFileNotFound(t *testing.T) {
	err := runE([]string{"/nonexistent.zip"}, "extract", "")
	if err == nil {
		t.Fatal("expected error for nonexistent file")
	}
}

func TestRunE_CreateAndExtract(t *testing.T) {
	tmpDir := t.TempDir()

	if err := os.WriteFile(filepath.Join(tmpDir, "a.txt"), []byte("hello"), 0644); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(tmpDir, "b.txt"), []byte("world"), 0644); err != nil {
		t.Fatal(err)
	}

	zipPath := filepath.Join(tmpDir, "out.zip")
	err := runE([]string{
		filepath.Join(tmpDir, "a.txt"),
		filepath.Join(tmpDir, "b.txt"),
	}, "create", zipPath)
	if err != nil {
		t.Fatalf("create failed: %v", err)
	}

	if _, err := os.Stat(zipPath); os.IsNotExist(err) {
		t.Fatal("zip file not created")
	}

	extractDir := filepath.Join(tmpDir, "extracted")
	err = runE([]string{zipPath}, "extract", extractDir)
	if err != nil {
		t.Fatalf("extract failed: %v", err)
	}

	for _, name := range []string{"a.txt", "b.txt"} {
		data, err := os.ReadFile(filepath.Join(extractDir, name))
		if err != nil {
			t.Errorf("missing extracted file: %s", name)
			continue
		}
		if len(data) == 0 {
			t.Errorf("empty extracted file: %s", name)
		}
	}
}
