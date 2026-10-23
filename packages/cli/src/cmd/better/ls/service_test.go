package ls

import (
	"io"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestRunShort(t *testing.T) {
	dir := t.TempDir()
	os.WriteFile(filepath.Join(dir, "a.txt"), []byte("a"), 0644)
	os.WriteFile(filepath.Join(dir, "b.txt"), []byte("bb"), 0644)

	r, w, _ := os.Pipe()
	orig := os.Stdout
	os.Stdout = w

	cmd := NewCommand()
	err := run(cmd, dir, false, false, false, false, false, false, false)

	w.Close()
	os.Stdout = orig
	out, _ := io.ReadAll(r)

	if err != nil {
		t.Fatal(err)
	}
	output := string(out)
	if !strings.Contains(output, "a.txt") {
		t.Errorf("expected a.txt in output, got:\n%s", output)
	}
	if !strings.Contains(output, "b.txt") {
		t.Errorf("expected b.txt in output, got:\n%s", output)
	}
}

func TestRunLong(t *testing.T) {
	dir := t.TempDir()
	os.WriteFile(filepath.Join(dir, "f.dat"), []byte("hello"), 0644)

	r, w, _ := os.Pipe()
	orig := os.Stdout
	os.Stdout = w

	cmd := NewCommand()
	err := run(cmd, dir, false, true, false, false, false, false, false)

	w.Close()
	os.Stdout = orig
	out, _ := io.ReadAll(r)

	if err != nil {
		t.Fatal(err)
	}

	output := string(out)
	if !strings.Contains(output, "Type") || !strings.Contains(output, "Mode") {
		t.Errorf("expected long format headers, got:\n%s", output)
	}
	if !strings.Contains(output, "f.dat") {
		t.Errorf("expected f.dat in output, got:\n%s", output)
	}
}

func TestRunJSON(t *testing.T) {
	dir := t.TempDir()
	os.WriteFile(filepath.Join(dir, "x.go"), []byte("package x"), 0644)

	r, w, _ := os.Pipe()
	orig := os.Stdout
	os.Stdout = w

	cmd := NewCommand()
	err := run(cmd, dir, false, false, false, false, false, false, true)

	w.Close()
	os.Stdout = orig
	out, _ := io.ReadAll(r)

	if err != nil {
		t.Fatal(err)
	}

	output := string(out)
	if !strings.Contains(output, `"name": "x.go"`) {
		t.Errorf("expected JSON with x.go, got:\n%s", output)
	}
	if !strings.Contains(output, `"count"`) {
		t.Errorf("expected count in JSON, got:\n%s", output)
	}
}

func TestRunHiddenFiles(t *testing.T) {
	dir := t.TempDir()
	os.WriteFile(filepath.Join(dir, ".hidden"), []byte("secret"), 0644)
	os.WriteFile(filepath.Join(dir, "visible"), []byte("public"), 0644)

	r, w, _ := os.Pipe()
	orig := os.Stdout
	os.Stdout = w

	cmd := NewCommand()
	err := run(cmd, dir, false, false, false, false, false, false, false)

	w.Close()
	os.Stdout = orig
	out, _ := io.ReadAll(r)

	if err != nil {
		t.Fatal(err)
	}

	output := string(out)
	if strings.Contains(output, ".hidden") {
		t.Errorf("expected hidden file to be excluded, got:\n%s", output)
	}
	if !strings.Contains(output, "visible") {
		t.Errorf("expected visible file in output, got:\n%s", output)
	}
}

func TestRunAllShowsHidden(t *testing.T) {
	dir := t.TempDir()
	os.WriteFile(filepath.Join(dir, ".hidden"), []byte("secret"), 0644)

	r, w, _ := os.Pipe()
	orig := os.Stdout
	os.Stdout = w

	cmd := NewCommand()
	err := run(cmd, dir, true, false, false, false, false, false, false)

	w.Close()
	os.Stdout = orig
	out, _ := io.ReadAll(r)

	if err != nil {
		t.Fatal(err)
	}

	output := string(out)
	if !strings.Contains(output, ".hidden") {
		t.Errorf("expected .hidden file with --all, got:\n%s", output)
	}
}

func TestRunHuman(t *testing.T) {
	dir := t.TempDir()
	os.WriteFile(filepath.Join(dir, "big.bin"), make([]byte, 2048), 0644)

	r, w, _ := os.Pipe()
	orig := os.Stdout
	os.Stdout = w

	cmd := NewCommand()
	err := run(cmd, dir, false, true, true, false, false, false, false)

	w.Close()
	os.Stdout = orig
	out, _ := io.ReadAll(r)

	if err != nil {
		t.Fatal(err)
	}

	output := string(out)
	if !strings.Contains(output, "2.0K") {
		t.Errorf("expected human-readable size (2.0K), got:\n%s", output)
	}
}

func TestRunNotADir(t *testing.T) {
	f, _ := os.CreateTemp("", "file")
	f.Close()
	defer os.Remove(f.Name())

	cmd := NewCommand()
	err := run(cmd, f.Name(), false, false, false, false, false, false, false)
	if err == nil {
		t.Error("expected error for non-directory path")
	}
}
