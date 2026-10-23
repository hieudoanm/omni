package cmd

import (
	"bytes"
	"io"
	"os"
	"strings"
	"testing"
	"time"

	version "github.com/hieudoanm/omni/packages/cli/src/cmd/version"
	"github.com/hieudoanm/omni/packages/cli/src/libs/history"
)

func TestRootCmd(t *testing.T) {
	if rootCmd.Use != "omni" {
		t.Errorf("expected root command use 'omni', got %q", rootCmd.Use)
	}
}

func TestVersionCmd(t *testing.T) {
	ver := version.NewCommand()
	if ver.Use != "version" {
		t.Errorf("expected version command use 'version', got %q", ver.Use)
	}
}

func TestGetCWD(t *testing.T) {
	d := getCWD()
	if d == "" {
		t.Error("getCWD() returned empty string, expected current working directory")
	}
}

func TestGetCWD_Error(t *testing.T) {
	orig := osGetwd
	osGetwd = func() (string, error) {
		return "", os.ErrNotExist
	}
	defer func() { osGetwd = orig }()

	d := getCWD()
	if d != "" {
		t.Errorf("expected empty string on getwd error, got %q", d)
	}
}

func TestShouldTrack(t *testing.T) {
	tests := []struct {
		cmdPath string
		want    bool
	}{
		{"", false},
		{"omni", false},
		{"omni help", false},
		{"omni help calc", false},
		{"omni completion", false},
		{"omni completion --shell bash", false},
		{"omni history", false},
		{"omni history list", false},
		{"omni mcp", false},
		{"omni mcp run", false},
		{"omni calc bmi --height 175 --weight 70", true},
		{"omni version", true},
		{"omni system monitor", true},
		{"omni convert base64 --input hello", true},
	}
	for _, tc := range tests {
		got := shouldTrack(tc.cmdPath)
		if got != tc.want {
			t.Errorf("shouldTrack(%q) = %v, want %v", tc.cmdPath, got, tc.want)
		}
	}
}

func TestTrackCommand_Trackable(t *testing.T) {
	tmpDir := t.TempDir()
	t.Setenv("HOME", tmpDir)
	t.Setenv("USERPROFILE", tmpDir)

	saved := lastCommandPath
	lastCommandPath = "omni version"
	defer func() { lastCommandPath = saved }()

	start := time.Now()
	trackCommand(start, nil)

	entries, err := history.List(10)
	if err != nil {
		t.Fatalf("List failed: %v", err)
	}
	if len(entries) != 1 {
		t.Fatalf("expected 1 entry, got %d", len(entries))
	}
	if entries[0].Command != "omni version" {
		t.Errorf("expected command 'omni version', got %q", entries[0].Command)
	}
	if entries[0].Source != "cli" {
		t.Errorf("expected source 'cli', got %q", entries[0].Source)
	}
	if entries[0].Error != "" {
		t.Errorf("expected no error, got %q", entries[0].Error)
	}
	if entries[0].DurationMs < 0 {
		t.Errorf("expected non-negative DurationMs, got %d", entries[0].DurationMs)
	}
}

func TestTrackCommand_NotTrackable(t *testing.T) {
	tmpDir := t.TempDir()
	t.Setenv("HOME", tmpDir)
	t.Setenv("USERPROFILE", tmpDir)

	saved := lastCommandPath
	lastCommandPath = "omni help"
	defer func() { lastCommandPath = saved }()

	trackCommand(time.Now(), nil)

	entries, err := history.List(10)
	if err != nil {
		t.Fatalf("List failed: %v", err)
	}
	if len(entries) != 0 {
		t.Errorf("expected 0 entries for non-trackable command, got %d", len(entries))
	}
}

func TestTrackCommand_EmptyPath(t *testing.T) {
	tmpDir := t.TempDir()
	t.Setenv("HOME", tmpDir)
	t.Setenv("USERPROFILE", tmpDir)

	saved := lastCommandPath
	lastCommandPath = ""
	defer func() { lastCommandPath = saved }()

	trackCommand(time.Now(), nil)

	entries, err := history.List(10)
	if err != nil {
		t.Fatalf("List failed: %v", err)
	}
	if len(entries) != 0 {
		t.Errorf("expected 0 entries for empty path, got %d", len(entries))
	}
}

func TestExecute_Version(t *testing.T) {
	origArgs := os.Args
	origStdout := os.Stdout
	defer func() {
		os.Args = origArgs
		os.Stdout = origStdout
	}()

	tmpDir := t.TempDir()
	t.Setenv("HOME", tmpDir)
	t.Setenv("USERPROFILE", tmpDir)

	r, w, _ := os.Pipe()
	os.Stdout = w
	os.Args = []string{"omni", "version"}

	Execute()

	w.Close()
	var buf bytes.Buffer
	_, err := io.Copy(&buf, r)
	if err != nil {
		t.Fatalf("reading output: %v", err)
	}
	if buf.Len() == 0 {
		t.Error("expected version output, got empty")
	}
	if !strings.Contains(buf.String(), "Version:") {
		t.Errorf("expected version output containing 'Version:', got %q", buf.String())
	}
}

func TestTrackCommand_WithError(t *testing.T) {
	tmpDir := t.TempDir()
	t.Setenv("HOME", tmpDir)
	t.Setenv("USERPROFILE", tmpDir)

	saved := lastCommandPath
	lastCommandPath = "omni version"
	defer func() { lastCommandPath = saved }()

	trackCommand(time.Now(), os.ErrPermission)

	entries, err := history.List(10)
	if err != nil {
		t.Fatalf("List failed: %v", err)
	}
	if len(entries) != 1 {
		t.Fatalf("expected 1 entry, got %d", len(entries))
	}
	if entries[0].Command != "omni version" {
		t.Errorf("expected command 'omni version', got %q", entries[0].Command)
	}
	if entries[0].Error == "" {
		t.Error("expected error string to be set")
	}
}
