package tail

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

func TestRunTail(t *testing.T) {
	tmp := t.TempDir()
	path := filepath.Join(tmp, "test.txt")
	content := "line1\nline2\nline3\nline4\nline5\n"
	os.WriteFile(path, []byte(content), 0644)

	output := captureOutput(func() {
		if err := runTail(path, 2, false); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "line4") {
		t.Errorf("expected line4, got: %s", output)
	}
	if !strings.Contains(output, "line5") {
		t.Errorf("expected line5, got: %s", output)
	}
	if strings.Contains(output, "line1") {
		t.Errorf("expected only last 2 lines, got line1")
	}
}

func TestRunTail_DefaultLines(t *testing.T) {
	tmp := t.TempDir()
	path := filepath.Join(tmp, "test.txt")
	var content string
	for i := 1; i <= 15; i++ {
		content += "line\n"
	}
	os.WriteFile(path, []byte(content), 0644)

	output := captureOutput(func() {
		if err := runTail(path, 10, false); err != nil {
			t.Fatal(err)
		}
	})
	count := strings.Count(output, "line")
	if count != 10 {
		t.Errorf("expected 10 lines by default, got: %d", count)
	}
}

func TestRunTail_FileNotFound(t *testing.T) {
	err := runTail("/nonexistent/file.txt", 10, false)
	if err == nil {
		t.Fatal("expected error for nonexistent file")
	}
}
