package find

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
	os.Mkdir(filepath.Join(dir, "sub"), 0755)
	os.WriteFile(filepath.Join(dir, "sub", "b.txt"), []byte("b"), 0644)

	r, w, _ := os.Pipe()
	orig := os.Stdout
	os.Stdout = w

	cmd := NewCommand()
	err := run(cmd, dir, "", "", "", 0, true, false, false, false)

	w.Close()
	os.Stdout = orig
	out, _ := io.ReadAll(r)

	if err != nil {
		t.Fatal(err)
	}

	output := string(out)
	if !strings.Contains(output, "a.txt") {
		t.Errorf("expected a.txt, got:\n%s", output)
	}
	if !strings.Contains(output, "sub/") {
		t.Errorf("expected sub/, got:\n%s", output)
	}
}

func TestRunPattern(t *testing.T) {
	dir := t.TempDir()
	os.WriteFile(filepath.Join(dir, "foo.go"), []byte("package foo"), 0644)
	os.WriteFile(filepath.Join(dir, "foo.rs"), []byte("fn main() {}"), 0644)

	r, w, _ := os.Pipe()
	orig := os.Stdout
	os.Stdout = w

	cmd := NewCommand()
	err := run(cmd, dir, "*.go", "", "", 0, true, false, false, false)

	w.Close()
	os.Stdout = orig
	out, _ := io.ReadAll(r)

	if err != nil {
		t.Fatal(err)
	}

	output := string(out)
	if !strings.Contains(output, "foo.go") {
		t.Errorf("expected foo.go, got:\n%s", output)
	}
	if strings.Contains(output, "foo.rs") {
		t.Errorf("did not expect foo.rs, got:\n%s", output)
	}
}

func TestRunNameFilter(t *testing.T) {
	dir := t.TempDir()
	os.WriteFile(filepath.Join(dir, "main.go"), []byte("main"), 0644)
	os.WriteFile(filepath.Join(dir, "util.go"), []byte("util"), 0644)

	r, w, _ := os.Pipe()
	orig := os.Stdout
	os.Stdout = w

	cmd := NewCommand()
	err := run(cmd, dir, "", "main", "", 0, true, false, false, false)

	w.Close()
	os.Stdout = orig
	out, _ := io.ReadAll(r)

	if err != nil {
		t.Fatal(err)
	}

	output := string(out)
	if !strings.Contains(output, "main.go") {
		t.Errorf("expected main.go, got:\n%s", output)
	}
	if strings.Contains(output, "util.go") {
		t.Errorf("did not expect util.go, got:\n%s", output)
	}
}

func TestRunJSON(t *testing.T) {
	dir := t.TempDir()
	os.WriteFile(filepath.Join(dir, "data.json"), []byte("{}"), 0644)

	r, w, _ := os.Pipe()
	orig := os.Stdout
	os.Stdout = w

	cmd := NewCommand()
	err := run(cmd, dir, "", "", "", 0, true, false, false, true)

	w.Close()
	os.Stdout = orig
	out, _ := io.ReadAll(r)

	if err != nil {
		t.Fatal(err)
	}

	output := string(out)
	if !strings.Contains(output, `"name": "data.json"`) {
		t.Errorf("expected JSON with data.json, got:\n%s", output)
	}
	if !strings.Contains(output, `"count"`) {
		t.Errorf("expected count field, got:\n%s", output)
	}
}

func TestRunMaxDepth(t *testing.T) {
	dir := t.TempDir()
	os.MkdirAll(filepath.Join(dir, "l1", "l2", "l3"), 0755)
	os.WriteFile(filepath.Join(dir, "l1", "l2", "deep.txt"), []byte("deep"), 0644)

	r, w, _ := os.Pipe()
	orig := os.Stdout
	os.Stdout = w

	cmd := NewCommand()
	err := run(cmd, dir, "", "", "", 1, true, false, false, false)

	w.Close()
	os.Stdout = orig
	out, _ := io.ReadAll(r)

	if err != nil {
		t.Fatal(err)
	}

	output := string(out)
	if strings.Contains(output, "deep.txt") {
		t.Errorf("did not expect deep.txt at max-depth 1, got:\n%s", output)
	}
}

func TestRunTypeFilter(t *testing.T) {
	dir := t.TempDir()
	os.WriteFile(filepath.Join(dir, "file.txt"), []byte("f"), 0644)
	os.Mkdir(filepath.Join(dir, "subdir"), 0755)

	r, w, _ := os.Pipe()
	orig := os.Stdout
	os.Stdout = w

	cmd := NewCommand()
	err := run(cmd, dir, "", "", "f", 0, true, false, false, false)

	w.Close()
	os.Stdout = orig
	out, _ := io.ReadAll(r)

	if err != nil {
		t.Fatal(err)
	}

	output := string(out)
	if !strings.Contains(output, "file.txt") {
		t.Errorf("expected file.txt, got:\n%s", output)
	}
	if strings.Contains(output, "subdir") {
		t.Errorf("did not expect subdir, got:\n%s", output)
	}
}

func TestRunNotADir(t *testing.T) {
	f, _ := os.CreateTemp("", "file")
	f.Close()
	defer os.Remove(f.Name())

	cmd := NewCommand()
	err := run(cmd, f.Name(), "", "", "", 0, false, false, false, false)
	if err == nil {
		t.Error("expected error for non-directory path")
	}
}
