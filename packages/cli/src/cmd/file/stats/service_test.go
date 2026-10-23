package stats

import (
	"bytes"
	"io"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func captureOutput(fn func()) string {
	old := os.Stdout
	r, w, _ := os.Pipe()
	os.Stdout = w
	fn()
	w.Close()
	var buf bytes.Buffer
	io.Copy(&buf, r)
	os.Stdout = old
	return buf.String()
}

func TestRunStats(t *testing.T) {
	tmp := t.TempDir()
	os.WriteFile(filepath.Join(tmp, "a.txt"), []byte("hello"), 0644)
	os.WriteFile(filepath.Join(tmp, "b.go"), []byte("package main"), 0644)

	output := captureOutput(func() {
		if err := runStats(tmp, false); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, ".txt") {
		t.Errorf("expected .txt extension stats, got: %s", output)
	}
	if !strings.Contains(output, ".go") {
		t.Errorf("expected .go extension stats, got: %s", output)
	}
	if !strings.Contains(output, "Total files") {
		t.Errorf("expected Total files, got: %s", output)
	}
}

func TestRunStats_JSON(t *testing.T) {
	tmp := t.TempDir()
	os.WriteFile(filepath.Join(tmp, "a.txt"), []byte("hello"), 0644)
	os.WriteFile(filepath.Join(tmp, "b.go"), []byte("package main"), 0644)

	output := captureOutput(func() {
		if err := runStats(tmp, true); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "totalFiles") {
		t.Errorf("expected JSON totalFiles, got: %s", output)
	}
	if !strings.Contains(output, "byExtension") {
		t.Errorf("expected JSON byExtension, got: %s", output)
	}
}

func TestRunStats_MultipleExtensions(t *testing.T) {
	tmp := t.TempDir()
	os.WriteFile(filepath.Join(tmp, "a.txt"), []byte("hello"), 0644)
	os.WriteFile(filepath.Join(tmp, "b.go"), []byte("package main"), 0644)

	output := captureOutput(func() {
		if err := runStats(tmp, false); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "Total files") {
		t.Errorf("expected Total files, got: %s", output)
	}
}

func TestRunStats_EmptyDir(t *testing.T) {
	tmp := t.TempDir()
	output := captureOutput(func() {
		if err := runStats(tmp, false); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "Total files") {
		t.Errorf("expected Total files with empty dir, got: %s", output)
	}
}
