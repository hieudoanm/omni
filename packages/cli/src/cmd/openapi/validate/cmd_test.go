package validate

import (
	"bytes"
	"io"
	"os"
	"path/filepath"
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
	if cmd.Use != "validate [--file <file>]" {
		t.Errorf("Use = %q", cmd.Use)
	}
	if cmd.Short != "Validate an OpenAPI specification" {
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
	if cmd.Flag("file") == nil {
		t.Error("expected --file flag")
	}
}

func TestRunE_NoFile(t *testing.T) {
	cmd := NewCommand()
	cmd.SetArgs([]string{})
	if err := cmd.Execute(); err == nil {
		t.Error("expected error when --file is not provided")
	}
}

func TestRunE_WithIssues(t *testing.T) {
	dir := t.TempDir()
	f := filepath.Join(dir, "spec.json")
	spec := `{"openapi":"3.0.0","paths":{}}`
	os.WriteFile(f, []byte(spec), 0644)

	cmd := NewCommand()
	cmd.Flags().Set("file", f)
	err := cmd.RunE(cmd, nil)
	if err == nil {
		t.Error("expected error for spec with issues")
	}
}

func TestRunE_ValidSpec(t *testing.T) {
	dir := t.TempDir()
	f := filepath.Join(dir, "spec.json")
	spec := `{"openapi":"3.0.0","info":{"title":"Test","version":"1.0"},"paths":{}}`
	os.WriteFile(f, []byte(spec), 0644)

	cmd := NewCommand()
	cmd.Flags().Set("file", f)
	err := cmd.RunE(cmd, nil)
	if err != nil {
		t.Fatalf("expected success, got error: %v", err)
	}
}

func TestRunE_NonExistentFile(t *testing.T) {
	cmd := NewCommand()
	cmd.Flags().Set("file", "/nonexistent/spec.yaml")
	err := cmd.RunE(cmd, nil)
	if err == nil {
		t.Error("expected error for nonexistent file")
	}
}

func TestRunE_InvalidContent(t *testing.T) {
	dir := t.TempDir()
	f := filepath.Join(dir, "invalid.yaml")
	os.WriteFile(f, []byte("not valid yaml or json {{{{"), 0644)

	cmd := NewCommand()
	cmd.SetArgs([]string{"-f", f})
	if err := cmd.Execute(); err == nil {
		t.Error("expected error for invalid content")
	}
}
