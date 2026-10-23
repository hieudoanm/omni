package csv

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
	stdinW.Write([]byte("a,b,c\n1,2,3\n"))
	stdinW.Close()
	os.Stdin = stdinR

	oldStdout := os.Stdout
	stdoutR, stdoutW, _ := os.Pipe()
	os.Stdout = stdoutW

	err := runE([]string{}, false)

	stdoutW.Close()
	os.Stdout = oldStdout
	os.Stdin = oldStdin

	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	out, _ := io.ReadAll(stdoutR)
	if !strings.Contains(string(out), "1 | 2 | 3") {
		t.Errorf("output should contain piped record, got: %s", string(out))
	}
}

func TestRunE_File(t *testing.T) {
	dir := t.TempDir()
	f := filepath.Join(dir, "test.csv")
	if err := os.WriteFile(f, []byte("x,y,z\n4,5,6\n"), 0644); err != nil {
		t.Fatal(err)
	}

	old := os.Stdout
	r, w, _ := os.Pipe()
	os.Stdout = w

	err := runE([]string{f}, false)

	w.Close()
	os.Stdout = old

	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	out, _ := io.ReadAll(r)
	if !strings.Contains(string(out), "4 | 5 | 6") {
		t.Errorf("output should contain record, got: %s", string(out))
	}
}

func TestRunE_JsonOutput(t *testing.T) {
	oldStdin := os.Stdin
	stdinR, stdinW, _ := os.Pipe()
	stdinW.Write([]byte("a,b\n1,2\n"))
	stdinW.Close()
	os.Stdin = stdinR

	oldStdout := os.Stdout
	stdoutR, stdoutW, _ := os.Pipe()
	os.Stdout = stdoutW

	err := runE([]string{}, true)

	stdoutW.Close()
	os.Stdout = oldStdout
	os.Stdin = oldStdin

	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	out, _ := io.ReadAll(stdoutR)
	if !strings.Contains(string(out), "\"a\"") {
		t.Errorf("output should contain JSON, got: %s", string(out))
	}
}

func TestRunE_MissingFile(t *testing.T) {
	err := runE([]string{"/nonexistent/file.csv"}, false)
	if err == nil {
		t.Error("expected error for missing file")
	}
}
