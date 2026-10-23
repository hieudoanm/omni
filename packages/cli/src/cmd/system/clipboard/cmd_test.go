package clipboard

import (
	"testing"
)

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "clipboard" {
		t.Errorf("Use = %q, want 'clipboard'", cmd.Use)
	}
	if cmd.Short != "Watch clipboard changes and store them in SQLite" {
		t.Errorf("Short = %q, want 'Watch clipboard changes and store them in SQLite'", cmd.Short)
	}
	if cmd.Flag("json") == nil {
		t.Error("expected --json flag")
	}
}

func TestNewCmd_RunE(t *testing.T) {
	orig := runWatcherFn
	runWatcherFn = func() {}
	defer func() { runWatcherFn = orig }()

	cmd := NewCmd()
	err := cmd.RunE(cmd, nil)
	if err != nil {
		t.Fatal(err)
	}
}
