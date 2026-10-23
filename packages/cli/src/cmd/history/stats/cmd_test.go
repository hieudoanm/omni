package stats

import (
	"io"
	"os"
	"strings"
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/libs/history"
)

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "stats" {
		t.Errorf("Use = %q, want %q", cmd.Use, "stats")
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

func TestRunStats_TextOutput(t *testing.T) {
	tmpDir := t.TempDir()
	t.Setenv("HOME", tmpDir)
	t.Setenv("USERPROFILE", tmpDir)

	history.Append(history.Entry{Timestamp: "now", Source: "cli", Command: "ls", DurationMs: 0})
	history.Append(history.Entry{Timestamp: "now", Source: "mcp", Command: "file.read", DurationMs: 0})

	old := os.Stdout
	r, w, _ := os.Pipe()
	os.Stdout = w

	err := runStats(false)

	w.Close()
	os.Stdout = old

	if err != nil {
		t.Fatalf("runStats(false) error: %v", err)
	}
	out, _ := io.ReadAll(r)
	if !strings.Contains(string(out), "CLI commands:") {
		t.Errorf("expected CLI commands in output, got %q", string(out))
	}
	if !strings.Contains(string(out), "MCP tool calls:") {
		t.Errorf("expected MCP tool calls in output, got %q", string(out))
	}
}

func TestRunStats_JSONOutput(t *testing.T) {
	tmpDir := t.TempDir()
	t.Setenv("HOME", tmpDir)
	t.Setenv("USERPROFILE", tmpDir)

	history.Append(history.Entry{Timestamp: "now", Source: "cli", Command: "ls", DurationMs: 0})

	old := os.Stdout
	r, w, _ := os.Pipe()
	os.Stdout = w

	err := runStats(true)

	w.Close()
	os.Stdout = old

	if err != nil {
		t.Fatalf("runStats(true) error: %v", err)
	}
	out, _ := io.ReadAll(r)
	outStr := strings.TrimSpace(string(out))
	if !strings.HasPrefix(outStr, "{") {
		t.Errorf("expected JSON output, got %q", outStr)
	}
	if !strings.Contains(outStr, "total_cli") {
		t.Errorf("expected total_cli in JSON, got %q", outStr)
	}
}

func TestRunStats_EmptyStats(t *testing.T) {
	tmpDir := t.TempDir()
	t.Setenv("HOME", tmpDir)
	t.Setenv("USERPROFILE", tmpDir)

	err := runStats(false)
	if err != nil {
		t.Fatalf("runStats(false) on empty history error: %v", err)
	}
}
