package size

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

func TestRunSize_File(t *testing.T) {
	tmp := t.TempDir()
	path := filepath.Join(tmp, "test.txt")
	content := []byte("hello world")
	os.WriteFile(path, content, 0644)

	output := captureOutput(func() {
		if err := runSize(path, false); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "11") {
		t.Errorf("expected size 11, got: %s", output)
	}
}

func TestRunSize_Directory(t *testing.T) {
	tmp := t.TempDir()
	os.WriteFile(filepath.Join(tmp, "a.txt"), []byte("hello"), 0644)
	os.WriteFile(filepath.Join(tmp, "b.txt"), []byte("world!!!"), 0644)

	output := captureOutput(func() {
		if err := runSize(tmp, false); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "B") {
		t.Errorf("expected size with B suffix, got: %s", output)
	}
	if !strings.Contains(output, tmp) {
		t.Errorf("expected path in output, got: %s", output)
	}
}

func TestRunSize_FileJSON(t *testing.T) {
	tmp := t.TempDir()
	path := filepath.Join(tmp, "test.txt")
	os.WriteFile(path, []byte("data"), 0644)

	output := captureOutput(func() {
		if err := runSize(path, true); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "size") {
		t.Errorf("expected JSON size field, got: %s", output)
	}
}

func TestRunSize_DirJSON(t *testing.T) {
	tmp := t.TempDir()
	os.WriteFile(filepath.Join(tmp, "a.txt"), []byte("hello"), 0644)

	output := captureOutput(func() {
		if err := runSize(tmp, true); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "size") {
		t.Errorf("expected JSON size field, got: %s", output)
	}
}

func TestRunSize_PathNotFound(t *testing.T) {
	err := runSize("/nonexistent/path", false)
	if err == nil {
		t.Fatal("expected error for nonexistent path")
	}
}
