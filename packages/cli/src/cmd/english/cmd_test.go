package english

import (
	"testing"
)

func TestNewCommand(t *testing.T) {
	cmd := NewCommand()
	if cmd == nil {
		t.Fatal("NewCommand() returned nil")
	}
	if cmd.Use != "english" {
		t.Errorf("Use = %q, want %q", cmd.Use, "english")
	}
	if cmd.Short != "English dictionary tools" {
		t.Errorf("Short = %q", cmd.Short)
	}
	if cmd.Long == "" {
		t.Error("Long should not be empty")
	}
	if cmd.Example == "" {
		t.Error("Example should not be empty")
	}
	if cmd.RunE == nil {
		t.Fatal("RunE should not be nil")
	}
	subs := cmd.Commands()
	if len(subs) != 1 {
		t.Fatalf("expected 1 subcommand, got %d", len(subs))
	}
	if subs[0].Name() != "define" {
		t.Errorf("subcommand name = %q, want %q", subs[0].Name(), "define")
	}
}

func TestNewCommand_RunE_NoError(t *testing.T) {
	cmd := NewCommand()
	err := cmd.RunE(cmd, nil)
	if err != nil {
		t.Errorf("RunE should not error, got: %v", err)
	}
}

func TestNewCommand_PersistentFlags(t *testing.T) {
	cmd := NewCommand()
	f := cmd.PersistentFlags().Lookup("json")
	if f == nil {
		t.Fatal("expected --json persistent flag")
	}
	if f.Shorthand != "j" {
		t.Errorf("shorthand = %q, want %q", f.Shorthand, "j")
	}
}
