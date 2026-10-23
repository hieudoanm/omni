package yml

import (
	"io"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestRunE_Stdin(t *testing.T) {
	oldStdin := os.Stdin
	stdinR, stdinW, _ := os.Pipe()
	stdinW.Write([]byte("name: test\nage: 30\n"))
	stdinW.Close()
	os.Stdin = stdinR

	oldStdout := os.Stdout
	stdoutR, stdoutW, _ := os.Pipe()
	os.Stdout = stdoutW

	err := runE([]string{}, false, false, false)

	stdoutW.Close()
	os.Stdout = oldStdout
	os.Stdin = oldStdin

	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	out, _ := io.ReadAll(stdoutR)
	if !strings.Contains(string(out), "test") {
		t.Errorf("output should contain 'test', got: %s", string(out))
	}
}

func TestRunE_File(t *testing.T) {
	dir := t.TempDir()
	f := filepath.Join(dir, "config.yml")
	if err := os.WriteFile(f, []byte("key: value\n"), 0644); err != nil {
		t.Fatal(err)
	}

	old := os.Stdout
	r, w, _ := os.Pipe()
	os.Stdout = w

	err := runE([]string{f}, false, false, false)

	w.Close()
	os.Stdout = old

	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	out, _ := io.ReadAll(r)
	if !strings.Contains(string(out), "key") {
		t.Errorf("output should contain 'key', got: %s", string(out))
	}
}

func TestRunE_JsonOutput(t *testing.T) {
	oldStdin := os.Stdin
	stdinR, stdinW, _ := os.Pipe()
	stdinW.Write([]byte("name: test\n"))
	stdinW.Close()
	os.Stdin = stdinR

	oldStdout := os.Stdout
	stdoutR, stdoutW, _ := os.Pipe()
	os.Stdout = stdoutW

	err := runE([]string{}, false, false, true)

	stdoutW.Close()
	os.Stdout = oldStdout
	os.Stdin = oldStdin

	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	out, _ := io.ReadAll(stdoutR)
	if !strings.Contains(string(out), "test") {
		t.Errorf("output should contain 'test', got: %s", string(out))
	}
	if !strings.Contains(string(out), "\"name\"") {
		t.Errorf("output should be JSON formatted, got: %s", string(out))
	}
}

func TestRunE_Validate(t *testing.T) {
	dir := t.TempDir()
	f := filepath.Join(dir, "config.yml")
	if err := os.WriteFile(f, []byte("key: value\n"), 0644); err != nil {
		t.Fatal(err)
	}

	old := os.Stdout
	r, w, _ := os.Pipe()
	os.Stdout = w

	err := runE([]string{f}, true, false, false)

	w.Close()
	os.Stdout = old

	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	out, _ := io.ReadAll(r)
	if !strings.Contains(string(out), "Valid") {
		t.Errorf("output should contain 'Valid', got: %s", string(out))
	}
}

func TestRunE_ValidateJSON(t *testing.T) {
	dir := t.TempDir()
	f := filepath.Join(dir, "config.yml")
	if err := os.WriteFile(f, []byte("key: value\n"), 0644); err != nil {
		t.Fatal(err)
	}

	old := os.Stdout
	r, w, _ := os.Pipe()
	os.Stdout = w

	err := runE([]string{f}, true, false, true)

	w.Close()
	os.Stdout = old

	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	out, _ := io.ReadAll(r)
	if !strings.Contains(string(out), "valid") {
		t.Errorf("output should contain 'valid', got: %s", string(out))
	}
}

func TestRunE_Lint(t *testing.T) {
	dir := t.TempDir()
	f := filepath.Join(dir, "config.yml")
	if err := os.WriteFile(f, []byte("key: value\n"), 0644); err != nil {
		t.Fatal(err)
	}

	old := os.Stdout
	r, w, _ := os.Pipe()
	os.Stdout = w

	err := runE([]string{f}, false, true, false)

	w.Close()
	os.Stdout = old

	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	out, _ := io.ReadAll(r)
	if !strings.Contains(string(out), "No lint") {
		t.Errorf("output should contain 'No lint issues', got: %s", string(out))
	}
}

func TestRunE_LintJSON(t *testing.T) {
	dir := t.TempDir()
	f := filepath.Join(dir, "config.yml")
	if err := os.WriteFile(f, []byte("key: value\n"), 0644); err != nil {
		t.Fatal(err)
	}

	old := os.Stdout
	r, w, _ := os.Pipe()
	os.Stdout = w

	err := runE([]string{f}, false, true, true)

	w.Close()
	os.Stdout = old

	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	out, _ := io.ReadAll(r)
	if !strings.Contains(string(out), "no issues") {
		t.Errorf("output should contain 'no issues', got: %s", string(out))
	}
}

func TestRunE_MissingFile(t *testing.T) {
	err := runE([]string{"/nonexistent/file.yml"}, false, false, false)
	if err == nil {
		t.Error("expected error for missing file")
	}
}

func TestRunE_InvalidYAML(t *testing.T) {
	oldStdin := os.Stdin
	stdinR, stdinW, _ := os.Pipe()
	stdinW.Write([]byte(": invalid yaml [\n"))
	stdinW.Close()
	os.Stdin = stdinR

	err := runE([]string{}, false, false, false)

	os.Stdin = oldStdin

	if err == nil {
		t.Error("expected error for invalid YAML")
	}
}
