package postman

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

func TestNewCommand_Use(t *testing.T) {
	cmd := NewCommand()
	if cmd == nil {
		t.Fatal("NewCommand() returned nil")
	}
	if cmd.Use != "openapi2postman" {
		t.Errorf("Use = %q", cmd.Use)
	}
	if cmd.Short != "Convert OpenAPI to Postman collection" {
		t.Errorf("Short = %q", cmd.Short)
	}
	if cmd.Long == "" {
		t.Error("Long should not be empty")
	}
	if cmd.Example == "" {
		t.Error("Example should not be empty")
	}
}

func TestNewCommand_Flags(t *testing.T) {
	cmd := NewCommand()
	if cmd.Flag("input") == nil {
		t.Error("expected --input flag")
	}
	if cmd.Flag("output") == nil {
		t.Error("expected --output flag")
	}
}

func TestRunE_NoInput(t *testing.T) {
	cmd := NewCommand()
	cmd.SetArgs([]string{})
	if err := cmd.Execute(); err == nil {
		t.Error("expected error when --input is not provided")
	}
}

func TestRunE_NonExistentFile(t *testing.T) {
	cmd := NewCommand()
	cmd.Flags().Set("input", "/nonexistent/spec.yaml")
	err := cmd.RunE(cmd, nil)
	if err == nil {
		t.Error("expected error for nonexistent file")
	}
}

func TestRunE_ValidContent(t *testing.T) {
	dir := t.TempDir()
	f := filepath.Join(dir, "spec.json")
	spec := `{"openapi":"3.0.0","info":{"title":"Test","version":"1.0"},"paths":{"/test":{"get":{"responses":{"200":{"description":"OK"}}}}}}`
	os.WriteFile(f, []byte(spec), 0644)

	cmd := NewCommand()
	cmd.Flags().Set("input", f)
	output := captureOutput(func() {
		if err := cmd.RunE(cmd, nil); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "Test") {
		t.Errorf("expected Postman output with title, got %q", output)
	}
}

func TestRunE_InvalidContent(t *testing.T) {
	dir := t.TempDir()
	f := filepath.Join(dir, "spec.yaml")
	os.WriteFile(f, []byte("not valid json or yaml"), 0644)

	cmd := NewCommand()
	cmd.Flags().Set("input", f)
	err := cmd.RunE(cmd, nil)
	if err == nil {
		t.Error("expected error for invalid content")
	}
}

func TestRunE_NonExistentFileViaArgs(t *testing.T) {
	cmd := NewCommand()
	cmd.SetArgs([]string{"-i", "/nonexistent/file.yaml"})
	if err := cmd.Execute(); err == nil {
		t.Error("expected error for non-existent file")
	}
}
