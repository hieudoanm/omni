package decode

import (
	"bytes"
	"encoding/json"
	"image/png"
	"io"
	"os"
	"path/filepath"
	"testing"

	"rsc.io/qr"
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

func writeQRPNG(t *testing.T, data, dir string) string {
	t.Helper()
	code, err := qr.Encode(data, qr.M)
	if err != nil {
		t.Fatal(err)
	}
	path := filepath.Join(dir, "test_qr.png")
	f, err := os.Create(path)
	if err != nil {
		t.Fatal(err)
	}
	defer f.Close()
	if err := png.Encode(f, code.Image()); err != nil {
		t.Fatal(err)
	}
	return path
}

func TestRunDecode_Success(t *testing.T) {
	dir := t.TempDir()
	path := writeQRPNG(t, "hello world", dir)

	output := captureOutput(func() {
		if err := runDecode(path, false); err != nil {
			t.Fatal(err)
		}
	})

	if output != "hello world\n" {
		t.Errorf("got %q, want %q", output, "hello world\n")
	}
}

func TestRunDecode_JSON(t *testing.T) {
	dir := t.TempDir()
	path := writeQRPNG(t, "test-data-123", dir)

	output := captureOutput(func() {
		if err := runDecode(path, true); err != nil {
			t.Fatal(err)
		}
	})

	var result map[string]any
	if err := json.Unmarshal([]byte(output), &result); err != nil {
		t.Fatalf("invalid JSON: %v\noutput: %s", err, output)
	}
	if result["text"] != "test-data-123" {
		t.Errorf("expected text 'test-data-123', got %v", result["text"])
	}
}

func TestRunDecode_FileNotFound(t *testing.T) {
	err := runDecode("/nonexistent/path.png", false)
	if err == nil {
		t.Fatal("expected error for nonexistent file")
	}
}

func TestRunDecode_InvalidImage(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "invalid.txt")
	if err := os.WriteFile(path, []byte("not an image"), 0644); err != nil {
		t.Fatal(err)
	}

	err := runDecode(path, false)
	if err == nil {
		t.Fatal("expected error for invalid image")
	}
}
