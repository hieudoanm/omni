package testutil

import (
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

func CaptureStderr(t *testing.T, fn func() error) (string, error) {
	t.Helper()
	old := os.Stderr
	r, w, _ := os.Pipe()
	os.Stderr = w
	err := fn()
	w.Close()
	os.Stderr = old
	out, _ := io.ReadAll(r)
	return strings.TrimSpace(string(out)), err
}
