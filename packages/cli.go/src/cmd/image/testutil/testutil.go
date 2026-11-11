package testutil

import (
	"image"
	"image/color"
	"image/png"
	"io"
	"os"
	"strings"
	"testing"
)

func SetHomeTempDir(t *testing.T) string {
	t.Helper()
	tmpDir := t.TempDir()
	t.Setenv("HOME", tmpDir)
	t.Setenv("USERPROFILE", tmpDir)
	return tmpDir
}

func CaptureStdout(t *testing.T, fn func() error) (string, error) {
	t.Helper()
	old := os.Stdout
	r, w, _ := os.Pipe()
	os.Stdout = w
	err := fn()
	w.Close()
	os.Stdout = old
	out, _ := io.ReadAll(r)
	return strings.TrimSpace(string(out)), err
}

func CreateTestPNG(t *testing.T) string {
	t.Helper()
	img := image.NewRGBA(image.Rect(0, 0, 5, 5))
	img.Set(0, 0, color.RGBA{R: 255, G: 0, B: 0, A: 255})
	img.Set(4, 4, color.RGBA{R: 0, G: 0, B: 255, A: 255})
	tmpFile, err := os.CreateTemp(t.TempDir(), "test-*.png")
	if err != nil {
		t.Fatal(err)
	}
	defer tmpFile.Close()
	if err := png.Encode(tmpFile, img); err != nil {
		t.Fatal(err)
	}
	return tmpFile.Name()
}
