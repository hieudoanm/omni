package path

import (
	"testing"
)

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "path [command]" {
		t.Errorf("Use = %q", cmd.Use)
	}
	if cmd.Short != "List or search PATH directories and commands" {
		t.Errorf("Short = %q", cmd.Short)
	}
	if cmd.Flag("sort") == nil {
		t.Error("expected --sort flag")
	}
	if cmd.Flag("json") == nil {
		t.Error("expected --json flag")
	}
}

func TestPathRun_List(t *testing.T) {
	err := pathRun(nil, "", false, false)
	if err != nil {
		t.Errorf("unexpected error: %v", err)
	}
}

func TestPathRun_FindCommand(t *testing.T) {
	err := pathRun([]string{"sh"}, "", false, false)
	if err != nil {
		t.Errorf("unexpected error: %v", err)
	}
}

func TestPathRun_CommandNotFound(t *testing.T) {
	err := pathRun([]string{"nonexistent-command-xyz"}, "", false, false)
	if err == nil {
		t.Fatal("expected error")
	}
}

func TestPathRun_JSON(t *testing.T) {
	err := pathRun(nil, "", false, true)
	if err != nil {
		t.Errorf("unexpected error: %v", err)
	}
}

func TestPathRun_Filter(t *testing.T) {
	err := pathRun(nil, "/usr", false, false)
	if err != nil {
		t.Errorf("unexpected error: %v", err)
	}
}
