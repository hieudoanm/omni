package decode

import (
	"bytes"
	"encoding/json"
	"image"
	"image/color"
	"image/png"
	"io"
	"os"
	"path/filepath"
	"testing"

	"github.com/makiuchi-d/gozxing"
	"github.com/makiuchi-d/gozxing/oned"
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

func writeBarcodePNG(t *testing.T, data, format string, dir string) string {
	t.Helper()
	var fi formatInfo
	switch format {
	case "code128":
		fi = formatInfo{oned.NewCode128Writer, gozxing.BarcodeFormat_CODE_128}
	case "code39":
		fi = formatInfo{oned.NewCode39Writer, gozxing.BarcodeFormat_CODE_39}
	default:
		fi = formatInfo{oned.NewCode128Writer, gozxing.BarcodeFormat_CODE_128}
	}
	writer := fi.newWriter()
	matrix, err := writer.EncodeWithoutHint(data, fi.format, 200, 100)
	if err != nil {
		t.Fatal(err)
	}

	path := filepath.Join(dir, "barcode_"+format+".png")
	f, err := os.Create(path)
	if err != nil {
		t.Fatal(err)
	}
	defer f.Close()

	if err := png.Encode(f, matrixToImage(matrix)); err != nil {
		t.Fatal(err)
	}
	return path
}

type formatInfo struct {
	newWriter func() gozxing.Writer
	format    gozxing.BarcodeFormat
}

func matrixToImage(matrix *gozxing.BitMatrix) *image.Gray {
	w := matrix.GetWidth()
	h := matrix.GetHeight()
	img := image.NewGray(image.Rect(0, 0, w, h))
	for y := 0; y < h; y++ {
		for x := 0; x < w; x++ {
			if matrix.Get(x, y) {
				img.Set(x, y, color.Gray{Y: 0})
			} else {
				img.Set(x, y, color.Gray{Y: 255})
			}
		}
	}
	return img
}

func TestRunDecode_Success(t *testing.T) {
	dir := t.TempDir()
	path := writeBarcodePNG(t, "hello123", "code128", dir)

	output := captureOutput(func() {
		if err := runDecode(path, false); err != nil {
			t.Fatal(err)
		}
	})

	if len(output) == 0 {
		t.Error("expected non-empty output")
	}
}

func TestRunDecode_JSON(t *testing.T) {
	dir := t.TempDir()
	path := writeBarcodePNG(t, "test-123", "code128", dir)

	output := captureOutput(func() {
		if err := runDecode(path, true); err != nil {
			t.Fatal(err)
		}
	})

	var result map[string]any
	if err := json.Unmarshal([]byte(output), &result); err != nil {
		t.Fatalf("invalid JSON: %v\noutput: %s", err, output)
	}
	if result["text"] == "" {
		t.Error("expected non-empty text in JSON")
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
