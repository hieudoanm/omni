package encode

import (
	"bytes"
	"encoding/json"
	"image/png"
	"io"
	"os"
	"path/filepath"
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

func TestRunBarcode_NoData(t *testing.T) {
	err := runBarcode("", false, "", "", "code128", 400, 150, 10)
	if err == nil {
		t.Fatal("expected error for empty data")
	}
}

func TestRunBarcode_JSON(t *testing.T) {
	output := captureOutput(func() {
		if err := runBarcode("hello", true, "", "", "code128", 400, 150, 10); err != nil {
			t.Fatal(err)
		}
	})
	var result map[string]any
	if err := json.Unmarshal([]byte(output), &result); err != nil {
		t.Fatalf("invalid JSON: %v\noutput: %s", err, output)
	}
	if result["data"] != "hello" {
		t.Errorf("expected data 'hello', got %v", result["data"])
	}
}

func TestRunBarcode_Terminal(t *testing.T) {
	output := captureOutput(func() {
		if err := runBarcode("test123", false, "", "", "code128", 400, 150, 10); err != nil {
			t.Fatal(err)
		}
	})
	if len(output) == 0 {
		t.Error("expected non-empty terminal output")
	}
}

func TestRunBarcode_PNG(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "barcode_test.png")

	if err := runBarcode("https://example.com", false, "", path, "code128", 200, 100, 5); err != nil {
		t.Fatal(err)
	}

	f, err := os.Open(path)
	if err != nil {
		t.Fatal(err)
	}
	defer f.Close()

	_, err = png.Decode(f)
	if err != nil {
		t.Fatalf("invalid PNG: %v", err)
	}
}

func TestRunBarcode_Formats(t *testing.T) {
	dir := t.TempDir()
	tests := []struct {
		format string
		data   string
	}{
		{"code128", "hello123"},
		{"code39", "HELLO"},
		{"ean13", "5901234123457"},
		{"upca", "123456789012"},
	}
	for _, tt := range tests {
		path := filepath.Join(dir, "barcode_"+tt.format+".png")
		if err := runBarcode(tt.data, false, "", path, tt.format, 200, 100, 5); err != nil {
			t.Fatalf("format %s: %v", tt.format, err)
		}
	}
}

func TestRunBarcode_InvalidFormat(t *testing.T) {
	err := runBarcode("test", false, "", "", "invalid", 400, 150, 10)
	if err == nil {
		t.Fatal("expected error for unsupported format")
	}
}
