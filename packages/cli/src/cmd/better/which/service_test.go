package which

import (
	"io"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestRun(t *testing.T) {
	tmp := t.TempDir()
	bin := filepath.Join(tmp, "mycmd")
	os.WriteFile(bin, []byte("#!/bin/sh"), 0755)
	t.Setenv("PATH", tmp)

	r, w, _ := os.Pipe()
	orig := os.Stdout
	os.Stdout = w

	err := run([]string{"mycmd"}, false, false)

	w.Close()
	os.Stdout = orig
	out, _ := io.ReadAll(r)

	if err != nil {
		t.Fatal(err)
	}

	output := string(out)
	if !strings.Contains(output, "mycmd") || !strings.Contains(output, bin) {
		t.Errorf("expected mycmd with path in output, got:\n%s", output)
	}
}

func TestRunAll(t *testing.T) {
	tmp := t.TempDir()
	dir1 := filepath.Join(tmp, "dir1")
	dir2 := filepath.Join(tmp, "dir2")
	os.MkdirAll(dir1, 0755)
	os.MkdirAll(dir2, 0755)

	os.WriteFile(filepath.Join(dir1, "tool"), []byte("#!/bin/sh"), 0755)
	os.WriteFile(filepath.Join(dir2, "tool"), []byte("#!/bin/sh"), 0755)

	t.Setenv("PATH", dir1+":"+dir2)

	r, w, _ := os.Pipe()
	orig := os.Stdout
	os.Stdout = w

	err := run([]string{"tool"}, true, false)

	w.Close()
	os.Stdout = orig
	out, _ := io.ReadAll(r)

	if err != nil {
		t.Fatal(err)
	}

	output := string(out)
	// Should find both
	count := strings.Count(output, "tool")
	if count < 2 {
		t.Errorf("expected both matches, got %d, output:\n%s", count, output)
	}
}

func TestRunNotFound(t *testing.T) {
	t.Setenv("PATH", t.TempDir())

	r, w, _ := os.Pipe()
	orig := os.Stdout
	os.Stdout = w

	err := run([]string{"nonexistent_cmd_xyz"}, false, false)

	w.Close()
	os.Stdout = orig
	out, _ := io.ReadAll(r)

	if err != nil {
		t.Fatal(err)
	}

	output := string(out)
	if !strings.Contains(output, "not found") {
		t.Errorf("expected 'not found' in output, got:\n%s", output)
	}
}

func TestRunJSON(t *testing.T) {
	tmp := t.TempDir()
	bin := filepath.Join(tmp, "jsoncmd")
	os.WriteFile(bin, []byte("#!/bin/sh"), 0755)
	t.Setenv("PATH", tmp)

	r, w, _ := os.Pipe()
	orig := os.Stdout
	os.Stdout = w

	err := run([]string{"jsoncmd"}, false, true)

	w.Close()
	os.Stdout = orig
	out, _ := io.ReadAll(r)

	if err != nil {
		t.Fatal(err)
	}

	output := string(out)
	if !strings.Contains(output, `"name": "jsoncmd"`) {
		t.Errorf("expected JSON with name, got:\n%s", output)
	}
	if !strings.Contains(output, `"count"`) {
		t.Errorf("expected count field, got:\n%s", output)
	}
}

func TestRunMultipleNames(t *testing.T) {
	tmp := t.TempDir()
	os.WriteFile(filepath.Join(tmp, "cmd_a"), []byte("#!/bin/sh"), 0755)
	os.WriteFile(filepath.Join(tmp, "cmd_b"), []byte("#!/bin/sh"), 0755)
	t.Setenv("PATH", tmp)

	r, w, _ := os.Pipe()
	orig := os.Stdout
	os.Stdout = w

	err := run([]string{"cmd_a", "cmd_b"}, false, false)

	w.Close()
	os.Stdout = orig
	out, _ := io.ReadAll(r)

	if err != nil {
		t.Fatal(err)
	}

	output := string(out)
	if !strings.Contains(output, "cmd_a") || !strings.Contains(output, "cmd_b") {
		t.Errorf("expected both commands in output, got:\n%s", output)
	}
}

func TestPrintTable(t *testing.T) {
	r, w, _ := os.Pipe()
	orig := os.Stdout
	os.Stdout = w

	err := printTable([]string{"NAME", "PATH"}, [][]string{{"go", "/usr/local/go/bin/go"}})
	if err != nil {
		t.Fatal(err)
	}

	w.Close()
	os.Stdout = orig
	out, _ := io.ReadAll(r)

	output := string(out)
	if !strings.Contains(output, "NAME") || !strings.Contains(output, "PATH") {
		t.Errorf("expected headers in output, got:\n%s", output)
	}
}
