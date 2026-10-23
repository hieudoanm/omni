package grep

import (
	"bytes"
	"encoding/json"
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
	if cmd.Use != "grep [--pattern <regex>] [--path <dir>]" {
		t.Errorf("Use = %q", cmd.Use)
	}
}

func TestNewCommand_Flags(t *testing.T) {
	cmd := NewCommand()
	_, err := cmd.Flags().GetString("pattern")
	if err != nil {
		t.Error("expected --pattern flag")
	}
	_, err = cmd.Flags().GetString("path")
	if err != nil {
		t.Error("expected --path flag")
	}
	_, err = cmd.Flags().GetString("include")
	if err != nil {
		t.Error("expected --include flag")
	}
	_, err = cmd.Flags().GetInt("context")
	if err != nil {
		t.Error("expected --context flag")
	}
	_, err = cmd.Flags().GetBool("fixed")
	if err != nil {
		t.Error("expected --fixed flag")
	}
	_, err = cmd.Flags().GetInt("max-count")
	if err != nil {
		t.Error("expected --max-count flag")
	}
	_, err = cmd.Flags().GetBool("ignore-case")
	if err != nil {
		t.Error("expected --ignore-case flag")
	}
}

func TestRunE_WithPattern(t *testing.T) {
	dir := t.TempDir()
	os.WriteFile(filepath.Join(dir, "test.txt"), []byte("hello world\nthis is a test\n"), 0644)
	os.WriteFile(filepath.Join(dir, "other.txt"), []byte("no match here\n"), 0644)

	cmd := NewCommand()
	cmd.Flags().Set("pattern", "hello")
	cmd.Flags().Set("path", dir)
	output := captureOutput(func() {
		if err := cmd.RunE(cmd, nil); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "hello") {
		t.Errorf("expected match in output, got %q", output)
	}
}

func TestRunE_WithArgs(t *testing.T) {
	dir := t.TempDir()
	os.WriteFile(filepath.Join(dir, "a.txt"), []byte("match\n"), 0644)

	cmd := NewCommand()
	cmd.Flags().Set("pattern", "match")
	output := captureOutput(func() {
		if err := cmd.RunE(cmd, []string{dir}); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "match") {
		t.Errorf("expected match in output, got %q", output)
	}
}

func TestRunE_DefaultPath(t *testing.T) {
	dir := t.TempDir()
	os.WriteFile(filepath.Join(dir, "search.txt"), []byte("hello world\n"), 0644)

	oldDir, _ := os.Getwd()
	os.Chdir(dir)
	defer os.Chdir(oldDir)

	cmd := NewCommand()
	cmd.Flags().Set("pattern", "hello")
	output := captureOutput(func() {
		if err := cmd.RunE(cmd, nil); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "hello") {
		t.Errorf("expected match, got %q", output)
	}
}

func TestRunE_InvalidRegex(t *testing.T) {
	cmd := NewCommand()
	cmd.Flags().Set("pattern", "[invalid")
	err := cmd.RunE(cmd, nil)
	if err == nil {
		t.Fatal("expected error for invalid regex")
	}
}

func TestRunE_JSON(t *testing.T) {
	dir := t.TempDir()
	os.WriteFile(filepath.Join(dir, "test.txt"), []byte("hello world\n"), 0644)

	cmd := NewCommand()
	cmd.Flags().Set("pattern", "hello")
	cmd.Flags().Set("path", dir)
	cmd.Flags().Bool("json", false, "JSON output")
	cmd.Flags().Set("json", "true")
	output := captureOutput(func() {
		if err := cmd.RunE(cmd, nil); err != nil {
			t.Fatal(err)
		}
	})
	var result map[string]interface{}
	if err := json.Unmarshal([]byte(output), &result); err != nil {
		t.Fatalf("invalid JSON: %v\noutput: %s", err, output)
	}
	if result["matches"].(float64) != 1 {
		t.Errorf("matches = %v, want 1", result["matches"])
	}
	if result["pattern"] != "hello" {
		t.Errorf("pattern = %v, want %q", result["pattern"], "hello")
	}
}
