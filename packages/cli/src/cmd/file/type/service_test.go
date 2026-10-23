package ftype

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

func TestRunType(t *testing.T) {
	tmp := t.TempDir()
	path := filepath.Join(tmp, "test.txt")
	os.WriteFile(path, []byte("hello"), 0644)

	output := captureOutput(func() {
		if err := runType(path, false); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "text/plain") {
		t.Errorf("expected text/plain MIME, got: %s", output)
	}
	if !strings.Contains(output, "Size") {
		t.Errorf("expected Size field, got: %s", output)
	}
	if !strings.Contains(output, "MIME") {
		t.Errorf("expected MIME field, got: %s", output)
	}
}

func TestRunType_PDF(t *testing.T) {
	tmp := t.TempDir()
	path := filepath.Join(tmp, "doc.pdf")
	os.WriteFile(path, []byte("%PDF-1.4"), 0644)

	output := captureOutput(func() {
		if err := runType(path, false); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "application/pdf") {
		t.Errorf("expected application/pdf MIME, got: %s", output)
	}
}

func TestRunType_FileNotFound(t *testing.T) {
	err := runType("/nonexistent/file.txt", false)
	if err == nil {
		t.Fatal("expected error for nonexistent file")
	}
}
