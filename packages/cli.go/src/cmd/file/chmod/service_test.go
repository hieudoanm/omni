package chmod

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

func TestRunChmod(t *testing.T) {
	tmp := t.TempDir()
	path := filepath.Join(tmp, "test.sh")
	os.WriteFile(path, []byte("#!/bin/sh\necho hello"), 0644)

	if err := runChmod(path, "755", false, false); err != nil {
		t.Fatal(err)
	}
	info, err := os.Stat(path)
	if err != nil {
		t.Fatal(err)
	}
	if info.Mode().Perm() != 0755 {
		t.Errorf("expected 0755, got: %o", info.Mode().Perm())
	}
}

func TestRunChmod_InvalidMode(t *testing.T) {
	tmp := t.TempDir()
	path := filepath.Join(tmp, "test.sh")
	os.WriteFile(path, []byte("data"), 0644)

	err := runChmod(path, "invalid", false, false)
	if err == nil {
		t.Fatal("expected error for invalid mode")
	}
}

func TestRunChmod_JSON(t *testing.T) {
	tmp := t.TempDir()
	path := filepath.Join(tmp, "test.sh")
	os.WriteFile(path, []byte("data"), 0644)

	output := captureOutput(func() {
		if err := runChmod(path, "755", false, true); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "test.sh") {
		t.Errorf("expected file path in JSON output, got: %s", output)
	}
	if !strings.Contains(output, "755") {
		t.Errorf("expected mode in JSON output, got: %s", output)
	}
}

func TestRunChmod_NonExistentFile(t *testing.T) {
	err := runChmod("/nonexistent/path/file.txt", "755", false, false)
	if err == nil {
		t.Fatal("expected error for non-existent file")
	}
}

func TestRunChmod_Recursive(t *testing.T) {
	tmp := t.TempDir()
	sub := filepath.Join(tmp, "subdir")
	os.Mkdir(sub, 0755)
	f1 := filepath.Join(tmp, "a.txt")
	f2 := filepath.Join(sub, "b.txt")
	os.WriteFile(f1, []byte("a"), 0644)
	os.WriteFile(f2, []byte("b"), 0644)

	if err := runChmod(tmp, "777", true, false); err != nil {
		t.Fatal(err)
	}
	for _, p := range []string{f1, f2} {
		info, err := os.Stat(p)
		if err != nil {
			t.Fatal(err)
		}
		if info.Mode().Perm() != 0777 {
			t.Errorf("expected 0777 for %s, got: %o", p, info.Mode().Perm())
		}
	}
}
