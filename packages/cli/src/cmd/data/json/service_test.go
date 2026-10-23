package json

import (
	"io"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestRunE_FileInput(t *testing.T) {
	dir := t.TempDir()
	f := filepath.Join(dir, "data.json")
	if err := os.WriteFile(f, []byte(`{"name":"test"}`), 0644); err != nil {
		t.Fatal(err)
	}

	old := os.Stdout
	r, w, _ := os.Pipe()
	os.Stdout = w

	err := runE([]string{f}, "", "", "")

	w.Close()
	os.Stdout = old

	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	out, _ := io.ReadAll(r)
	if !strings.Contains(string(out), "test") {
		t.Errorf("output should contain 'test', got: %s", string(out))
	}
}

func TestRunE_StdinInput(t *testing.T) {
	oldStdin := os.Stdin
	stdinR, stdinW, _ := os.Pipe()
	stdinW.Write([]byte(`{"name":"stdin_test"}`))
	stdinW.Close()
	os.Stdin = stdinR

	oldStdout := os.Stdout
	stdoutR, stdoutW, _ := os.Pipe()
	os.Stdout = stdoutW

	err := runE([]string{}, "", "", "")

	stdoutW.Close()
	os.Stdout = oldStdout
	os.Stdin = oldStdin

	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	out, _ := io.ReadAll(stdoutR)
	if !strings.Contains(string(out), "stdin_test") {
		t.Errorf("output should contain 'stdin_test', got: %s", string(out))
	}
}

func TestRunE_Query(t *testing.T) {
	dir := t.TempDir()
	f := filepath.Join(dir, "data.json")
	if err := os.WriteFile(f, []byte(`{"name":"john","age":30}`), 0644); err != nil {
		t.Fatal(err)
	}

	old := os.Stdout
	r, w, _ := os.Pipe()
	os.Stdout = w

	err := runE([]string{f}, ".name", "", "")

	w.Close()
	os.Stdout = old

	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	out, _ := io.ReadAll(r)
	if !strings.Contains(string(out), "john") {
		t.Errorf("output should contain 'john', got: %s", string(out))
	}
}

func TestRunE_Diff(t *testing.T) {
	dir := t.TempDir()
	f1 := filepath.Join(dir, "a.json")
	f2 := filepath.Join(dir, "b.json")
	if err := os.WriteFile(f1, []byte(`{"a":1}`), 0644); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(f2, []byte(`{"a":2}`), 0644); err != nil {
		t.Fatal(err)
	}

	old := os.Stdout
	r, w, _ := os.Pipe()
	os.Stdout = w

	err := runE([]string{f1}, "", f2, "")

	w.Close()
	os.Stdout = old

	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	out, _ := io.ReadAll(r)
	if !strings.Contains(string(out), "a") {
		t.Errorf("output should contain diff, got: %s", string(out))
	}
}

func TestRunE_Merge(t *testing.T) {
	dir := t.TempDir()
	base := filepath.Join(dir, "base.json")
	patch := filepath.Join(dir, "patch.json")
	if err := os.WriteFile(base, []byte(`{"a":1}`), 0644); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(patch, []byte(`{"b":2}`), 0644); err != nil {
		t.Fatal(err)
	}

	old := os.Stdout
	r, w, _ := os.Pipe()
	os.Stdout = w

	err := runE([]string{base}, "", "", patch)

	w.Close()
	os.Stdout = old

	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	out, _ := io.ReadAll(r)
	if !strings.Contains(string(out), "1") || !strings.Contains(string(out), "2") {
		t.Errorf("output should contain merged values, got: %s", string(out))
	}
}

func TestRunE_InvalidJSON(t *testing.T) {
	dir := t.TempDir()
	f := filepath.Join(dir, "bad.json")
	if err := os.WriteFile(f, []byte(`{invalid}`), 0644); err != nil {
		t.Fatal(err)
	}

	err := runE([]string{f}, "", "", "")
	if err == nil {
		t.Error("expected error for invalid JSON")
	}
}

func TestRunE_MissingFile(t *testing.T) {
	err := runE([]string{"/nonexistent/file.json"}, "", "", "")
	if err == nil {
		t.Error("expected error for missing file")
	}
}

func TestRunE_QueryMissingKey(t *testing.T) {
	dir := t.TempDir()
	f := filepath.Join(dir, "data.json")
	if err := os.WriteFile(f, []byte(`{"name":"test"}`), 0644); err != nil {
		t.Fatal(err)
	}

	err := runE([]string{f}, ".nonexistent", "", "")
	if err == nil {
		t.Error("expected error for missing key in query")
	}
}
