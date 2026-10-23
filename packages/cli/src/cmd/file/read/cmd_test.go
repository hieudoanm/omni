package read

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
	if cmd.Use != "read [--file <path>]" {
		t.Errorf("Use = %q", cmd.Use)
	}
	if cmd.Args != nil {
		t.Error("Args should not be set")
	}
}

func TestNewCommand_Flags(t *testing.T) {
	cmd := NewCommand()
	_, err := cmd.Flags().GetString("file")
	if err != nil {
		t.Error("expected --file flag")
	}
	_, err = cmd.Flags().GetInt("lines")
	if err != nil {
		t.Error("expected --lines flag")
	}
	_, err = cmd.Flags().GetInt("offset")
	if err != nil {
		t.Error("expected --offset flag")
	}
	_, err = cmd.Flags().GetBool("numbers")
	if err != nil {
		t.Error("expected --numbers flag")
	}
}

func TestExecutesAndShowsContent(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "test.txt")
	content := "hello world\nsecond line\n"
	os.WriteFile(path, []byte(content), 0644)

	cmd := NewCommand()
	cmd.Flags().Set("file", path)

	output := captureOutput(func() {
		if err := cmd.RunE(cmd, []string{}); err != nil {
			t.Fatal(err)
		}
	})

	if !strings.Contains(output, "hello world") {
		t.Errorf("expected file content in output, got: %s", output)
	}
	if !strings.Contains(output, "second line") {
		t.Errorf("expected second line in output, got: %s", output)
	}
}

func TestJSONOutput(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "test.txt")
	content := "hello world\nsecond line\n"
	os.WriteFile(path, []byte(content), 0644)

	cmd := NewCommand()
	cmd.Flags().Set("file", path)
	cmd.Flags().Bool("json", false, "JSON output")
	cmd.Flags().Set("json", "true")

	output := captureOutput(func() {
		if err := cmd.RunE(cmd, []string{}); err != nil {
			t.Fatal(err)
		}
	})

	var result map[string]interface{}
	if err := json.Unmarshal([]byte(output), &result); err != nil {
		t.Fatalf("invalid JSON output: %v\noutput: %s", err, output)
	}
	if result["file"] != path {
		t.Errorf("expected file %q, got %v", path, result["file"])
	}
	contentStr, ok := result["content"].(string)
	if !ok {
		t.Fatalf("expected content to be a string, got %T", result["content"])
	}
	if !strings.Contains(contentStr, "hello world") {
		t.Errorf("expected content to contain 'hello world', got %v", contentStr)
	}
}
