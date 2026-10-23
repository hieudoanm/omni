package split

import (
	"os"
	"path/filepath"
	"testing"
)

func TestRunE_FileNotFound(t *testing.T) {
	err := runE("/nonexistent/file.csv", "csv", 1000, "")
	if err == nil {
		t.Fatal("expected error for nonexistent file")
	}
}

func TestRunE_ExcelFormat(t *testing.T) {
	err := runE("test.csv", "excel", 1000, "")
	if err == nil {
		t.Fatal("expected error for excel format")
	}
}

func TestRunE_SplitSuccess(t *testing.T) {
	tmpDir := t.TempDir()
	csvPath := filepath.Join(tmpDir, "test.csv")
	content := "a,b,c\n1,2,3\n4,5,6\n7,8,9\n"
	if err := os.WriteFile(csvPath, []byte(content), 0644); err != nil {
		t.Fatal(err)
	}

	outputDir := filepath.Join(tmpDir, "out")
	os.MkdirAll(outputDir, 0755)

	err := runE(csvPath, "csv", 2, outputDir)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	entries, err := os.ReadDir(outputDir)
	if err != nil {
		t.Fatal(err)
	}
	if len(entries) != 2 {
		t.Errorf("expected 2 output files, got %d", len(entries))
	}
}
