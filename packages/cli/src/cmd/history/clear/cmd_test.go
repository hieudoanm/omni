package clear

import (
	"io"
	"os"
	"strings"
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/libs/history"
)

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "clear" {
		t.Errorf("Use = %q, want %q", cmd.Use, "clear")
	}
}

func TestNewCmd_RunE(t *testing.T) {
	tmpDir := t.TempDir()
	t.Setenv("HOME", tmpDir)
	t.Setenv("USERPROFILE", tmpDir)

	history.Append(history.Entry{Timestamp: "now", Source: "cli", Command: "ls", DurationMs: 0})

	cmd := NewCmd()
	err := cmd.RunE(cmd, []string{})
	if err != nil {
		t.Fatalf("RunE error: %v", err)
	}
}

func TestRunClear_TextOutput(t *testing.T) {
	tmpDir := t.TempDir()
	t.Setenv("HOME", tmpDir)
	t.Setenv("USERPROFILE", tmpDir)

	history.Append(history.Entry{Timestamp: "now", Source: "cli", Command: "ls", DurationMs: 0})

	old := os.Stdout
	r, w, _ := os.Pipe()
	os.Stdout = w

	err := runClear(false)

	w.Close()
	os.Stdout = old

	if err != nil {
		t.Fatalf("runClear(false) error: %v", err)
	}
	out, _ := io.ReadAll(r)
	if !strings.Contains(string(out), "history cleared") {
		t.Errorf("expected 'history cleared', got %q", string(out))
	}
}

func TestRunClear_JSONOutput(t *testing.T) {
	tmpDir := t.TempDir()
	t.Setenv("HOME", tmpDir)
	t.Setenv("USERPROFILE", tmpDir)

	old := os.Stdout
	r, w, _ := os.Pipe()
	os.Stdout = w

	err := runClear(true)

	w.Close()
	os.Stdout = old

	if err != nil {
		t.Fatalf("runClear(true) error: %v", err)
	}
	out, _ := io.ReadAll(r)
	outStr := strings.TrimSpace(string(out))
	if !strings.HasPrefix(outStr, "{") {
		t.Errorf("expected JSON output, got %q", outStr)
	}
	if !strings.Contains(outStr, "cleared") {
		t.Errorf("expected 'cleared' in JSON, got %q", outStr)
	}
}

func TestRunClear_Twice(t *testing.T) {
	tmpDir := t.TempDir()
	t.Setenv("HOME", tmpDir)
	t.Setenv("USERPROFILE", tmpDir)

	history.Append(history.Entry{Timestamp: "now", Source: "cli", Command: "ls", DurationMs: 0})

	if err := runClear(false); err != nil {
		t.Fatalf("first clear error: %v", err)
	}
	if err := runClear(false); err != nil {
		t.Fatalf("second clear error: %v", err)
	}
}
