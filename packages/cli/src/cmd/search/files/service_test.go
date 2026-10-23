package files

import (
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/search/shared"
)

func TestFilesCmd_GlobResult(t *testing.T) {
	dir := t.TempDir()
	os.WriteFile(filepath.Join(dir, "foo.txt"), []byte("a"), 0644)
	os.WriteFile(filepath.Join(dir, "bar.txt"), []byte("b"), 0644)
	os.WriteFile(filepath.Join(dir, "baz.go"), []byte("c"), 0644)

	results, err := findFilesWithGlob("*.txt", dir, 0, "", false)
	if err != nil {
		t.Fatal(err)
	}

	if len(results) != 2 {
		t.Fatalf("expected 2 results, got %d", len(results))
	}
}

func TestFilesCmd_EmptyGlob(t *testing.T) {
	dir := t.TempDir()
	os.WriteFile(filepath.Join(dir, "data.go"), []byte("a"), 0644)

	output := shared.CaptureOutput(func() {
		if err := outputFileResults(nil, "*.py", dir, false); err != nil {
			t.Fatal(err)
		}
	})

	if !strings.Contains(output, "no files found") {
		t.Errorf("expected 'no files found' message, got: %s", output)
	}
}

func TestIsHidden(t *testing.T) {
	tests := []struct {
		path string
		want bool
	}{
		{".git", true},
		{".hidden", true},
		{"visible", false},
		{"src/main.go", false},
		{".config/settings", true},
	}
	for _, tc := range tests {
		got := isHidden(tc.path)
		if got != tc.want {
			t.Errorf("isHidden(%q) = %v, want %v", tc.path, got, tc.want)
		}
	}
}

func TestIsHiddenBaseName(t *testing.T) {
	if !isHidden(".hidden/file.txt") {
		t.Error("isHidden should check path base")
	}
}

func TestFindFilesWithGlobBasic(t *testing.T) {
	dir := t.TempDir()
	os.WriteFile(filepath.Join(dir, "foo.txt"), []byte("a"), 0644)
	os.WriteFile(filepath.Join(dir, "bar.txt"), []byte("b"), 0644)
	os.WriteFile(filepath.Join(dir, "baz.go"), []byte("c"), 0644)

	results, err := findFilesWithGlob("*.txt", dir, 0, "", false)
	if err != nil {
		t.Fatal(err)
	}
	if len(results) != 2 {
		t.Fatalf("expected 2 results, got %d", len(results))
	}
	if !strings.HasSuffix(results[0], "bar.txt") || !strings.HasSuffix(results[1], "foo.txt") {
		t.Errorf("unexpected results: %v", results)
	}
}

func TestFindFilesWithGlobFileType(t *testing.T) {
	dir := t.TempDir()
	os.MkdirAll(filepath.Join(dir, "subdir"), 0755)
	os.WriteFile(filepath.Join(dir, "file.txt"), []byte("a"), 0644)
	os.WriteFile(filepath.Join(dir, "data.go"), []byte("b"), 0644)

	results, err := findFilesWithGlob("*.txt", dir, 0, "f", false)
	if err != nil {
		t.Fatal(err)
	}
	if len(results) != 1 {
		t.Fatalf("expected 1 file, got %d", len(results))
	}
	if !strings.HasSuffix(results[0], "file.txt") {
		t.Errorf("unexpected result: %s", results[0])
	}
}

func TestFindFilesWithGlobMaxDepth(t *testing.T) {
	dir := t.TempDir()
	os.MkdirAll(filepath.Join(dir, "sub"), 0755)
	os.WriteFile(filepath.Join(dir, "root.txt"), []byte("a"), 0644)
	os.WriteFile(filepath.Join(dir, "sub", "deep.txt"), []byte("b"), 0644)

	results, err := findFilesWithGlob("*.txt", dir, 1, "", false)
	if err != nil {
		t.Fatal(err)
	}
	if len(results) != 1 {
		t.Fatalf("expected 1 result (root only, depth=1 excludes sub/), got %d", len(results))
	}
}

func TestFindFilesWithGlobNonexistentDir(t *testing.T) {
	_, err := findFilesWithGlob("*.txt", "/nonexistent/dir", 0, "", false)
	if err == nil {
		t.Error("expected error for nonexistent directory")
	}
}

func TestFindFilesWithGlobNotADir(t *testing.T) {
	dir := t.TempDir()
	f := filepath.Join(dir, "file.txt")
	os.WriteFile(f, []byte("a"), 0644)

	_, err := findFilesWithGlob("*.txt", f, 0, "", false)
	if err == nil {
		t.Error("expected error when root is not a directory")
	}
}

func TestFindFilesWithGlobHidden(t *testing.T) {
	dir := t.TempDir()
	os.MkdirAll(filepath.Join(dir, ".hidden"), 0755)
	os.WriteFile(filepath.Join(dir, ".hidden", "secret.txt"), []byte("a"), 0644)
	os.WriteFile(filepath.Join(dir, "visible.txt"), []byte("b"), 0644)

	results, err := findFilesWithGlob("*.txt", dir, 0, "", true)
	if err != nil {
		t.Fatal(err)
	}
	if len(results) != 2 {
		t.Fatalf("expected 2 results (including hidden), got %d", len(results))
	}
}

func TestFindFilesWithGlobHiddenFileSkipped(t *testing.T) {
	dir := t.TempDir()
	os.WriteFile(filepath.Join(dir, ".secret.txt"), []byte("a"), 0644)
	os.WriteFile(filepath.Join(dir, "visible.txt"), []byte("b"), 0644)

	results, err := findFilesWithGlob("*.txt", dir, 0, "", false)
	if err != nil {
		t.Fatal(err)
	}
	if len(results) != 1 {
		t.Fatalf("expected 1 visible file, got %d", len(results))
	}
	if !strings.HasSuffix(results[0], "visible.txt") {
		t.Errorf("expected visible.txt only, got %v", results)
	}
}

func TestOutputFileResultsText(t *testing.T) {
	dir := t.TempDir()
	results := []string{filepath.Join(dir, "a.txt"), filepath.Join(dir, "b.txt")}
	output := shared.CaptureOutput(func() {
		if err := outputFileResults(results, "*.txt", dir, false); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "a.txt") {
		t.Errorf("expected a.txt in output, got: %s", output)
	}
	if !strings.Contains(output, "2 files found") {
		t.Errorf("expected count in output, got: %s", output)
	}
}

func TestOutputFileResultsJSON(t *testing.T) {
	dir := t.TempDir()
	results := []string{filepath.Join(dir, "a.txt")}
	output := shared.CaptureOutput(func() {
		if err := outputFileResults(results, "*.txt", dir, true); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, `"pattern": "*.txt"`) {
		t.Errorf("expected pattern in JSON, got: %s", output)
	}
	if !strings.Contains(output, `"count": 1`) {
		t.Errorf("expected count 1, got: %s", output)
	}
}

func TestOutputFileResultsEmpty(t *testing.T) {
	dir := t.TempDir()
	output := shared.CaptureOutput(func() {
		if err := outputFileResults(nil, "*.txt", dir, false); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "no files found") {
		t.Errorf("expected 'no files found', got: %s", output)
	}
}

func TestFindFilesWithGlobFileTypeDir(t *testing.T) {
	dir := t.TempDir()
	os.MkdirAll(filepath.Join(dir, "subdir"), 0755)
	os.WriteFile(filepath.Join(dir, "file.txt"), []byte("a"), 0644)

	_, err := findFilesWithGlob("*", dir, 0, "d", false)
	if err != nil {
		t.Fatal(err)
	}
}

func TestFindFilesWithGlobGlobstar(t *testing.T) {
	dir := t.TempDir()
	os.WriteFile(filepath.Join(dir, "test.txt"), []byte("x"), 0644)

	_, err := findFilesWithGlob("**/*.txt", dir, 0, "", false)
	if err != nil {
		t.Fatal(err)
	}
}
