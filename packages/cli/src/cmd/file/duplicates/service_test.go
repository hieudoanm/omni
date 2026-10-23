package duplicates

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

func TestRunDuplicates_NoDupes(t *testing.T) {
	tmp := t.TempDir()
	os.WriteFile(filepath.Join(tmp, "a.txt"), []byte("hello a"), 0644)
	os.WriteFile(filepath.Join(tmp, "b.txt"), []byte("hello b"), 0644)

	output := captureOutput(func() {
		if err := runDuplicates(tmp, 1, false); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "No duplicates") {
		t.Errorf("expected no duplicates, got: %s", output)
	}
}

func TestRunDuplicates_WithDupes(t *testing.T) {
	tmp := t.TempDir()
	content := []byte("duplicate content here")
	os.WriteFile(filepath.Join(tmp, "a.txt"), content, 0644)
	os.WriteFile(filepath.Join(tmp, "b.txt"), content, 0644)
	os.WriteFile(filepath.Join(tmp, "c.txt"), []byte("unique"), 0644)

	output := captureOutput(func() {
		if err := runDuplicates(tmp, 1, false); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "Duplicates") {
		t.Errorf("expected duplicates, got: %s", output)
	}
}

func TestRunDuplicates_WithDupesLarge(t *testing.T) {
	tmp := t.TempDir()
	content := make([]byte, 10000)
	os.WriteFile(filepath.Join(tmp, "a.dat"), content, 0644)
	os.WriteFile(filepath.Join(tmp, "b.dat"), content, 0644)

	output := captureOutput(func() {
		if err := runDuplicates(tmp, 100, false); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "Duplicates") {
		t.Errorf("expected duplicates, got: %s", output)
	}
}
