package encode

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

func TestCmd_RunE_WithData(t *testing.T) {
	cmd := NewCommand()

	output := captureOutput(func() {
		cmd.SetArgs([]string{"hello world"})
		if err := cmd.Execute(); err != nil {
			t.Fatal(err)
		}
	})

	if len(output) == 0 {
		t.Error("expected non-empty QR code output")
	}
}

func TestCmd_RunE_WithDataFlag(t *testing.T) {
	cmd := NewCommand()

	output := captureOutput(func() {
		cmd.SetArgs([]string{"--data", "hello world"})
		if err := cmd.Execute(); err != nil {
			t.Fatal(err)
		}
	})

	if len(output) == 0 {
		t.Error("expected non-empty QR code output")
	}
}

func TestRunQRCode_NoData(t *testing.T) {
	err := runQRCode("", false, "", "", "M", 1, false)
	if err == nil {
		t.Fatal("expected error for empty data")
	}
}

func TestRunQRCode_JSON(t *testing.T) {
	output := captureOutput(func() {
		if err := runQRCode("hello", true, "", "", "M", 1, false); err != nil {
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

func TestRunQRCode_PNG(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "qrcode_test.png")

	if err := runQRCode("https://example.com", false, "", path, "M", 4, false); err != nil {
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

func TestRunQRCode_PNG_Invert(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "qrcode_invert_test.png")

	if err := runQRCode("test data", false, "", path, "M", 4, true); err != nil {
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

func TestRunQRCode_PNG_Levels(t *testing.T) {
	dir := t.TempDir()
	for _, lvl := range []string{"L", "M", "Q", "H"} {
		path := filepath.Join(dir, "qrcode_"+lvl+".png")
		if err := runQRCode("test", false, "", path, lvl, 4, false); err != nil {
			t.Fatalf("level %s: %v", lvl, err)
		}
	}
}

func TestParseLevel(t *testing.T) {
	tests := []struct {
		input string
		want  qr.Level
	}{
		{"L", qr.L},
		{"l", qr.L},
		{"M", qr.M},
		{"m", qr.M},
		{"Q", qr.Q},
		{"q", qr.Q},
		{"H", qr.H},
		{"h", qr.H},
		{"invalid", qr.M},
		{"", qr.M},
	}
	for _, tt := range tests {
		got := parseLevel(tt.input)
		if got != tt.want {
			t.Errorf("parseLevel(%q) = %d, want %d", tt.input, got, tt.want)
		}
	}
}
