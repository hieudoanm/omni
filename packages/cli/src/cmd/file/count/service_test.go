package count

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

func TestRunCount(t *testing.T) {
	tmp := t.TempDir()
	path := filepath.Join(tmp, "test.txt")
	content := "line one\nline two\nline three\n"
	os.WriteFile(path, []byte(content), 0644)

	output := captureOutput(func() {
		if err := runCount(path, false); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "3") {
		t.Errorf("expected 3 lines, got: %s", output)
	}
	if !strings.Contains(output, "6") {
		t.Errorf("expected 6 words, got: %s", output)
	}
}

func TestRunCount_EmptyFile(t *testing.T) {
	tmp := t.TempDir()
	path := filepath.Join(tmp, "empty.txt")
	os.WriteFile(path, []byte(""), 0644)

	output := captureOutput(func() {
		if err := runCount(path, false); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "0") {
		t.Errorf("expected 0 counts, got: %s", output)
	}
}

func TestRunCount_FileNotFound(t *testing.T) {
	err := runCount("/nonexistent/file.txt", false)
	if err == nil {
		t.Fatal("expected error for nonexistent file")
	}
}
