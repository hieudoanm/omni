package games

import (
	"testing"
)

func TestNewCommand(t *testing.T) {
	cmd := NewCommand()
	if cmd.Use != "games" {
		t.Errorf("NewCommand().Use = %q, want %q", cmd.Use, "games")
	}
	if cmd.Short == "" {
		t.Error("NewCommand().Short should not be empty")
	}
}

func TestNewCommandHasSubcommands(t *testing.T) {
	cmd := NewCommand()
	if len(cmd.Commands()) == 0 {
		t.Fatal("NewCommand() has no subcommands")
	}
}

func TestNewCommandSubcommandNames(t *testing.T) {
	cmd := NewCommand()
	names := make(map[string]bool)
	for _, sub := range cmd.Commands() {
		names[sub.Name()] = true
	}
	expected := []string{"anagram", "reaction", "recall", "typerace", "wordle"}
	for _, name := range expected {
		if !names[name] {
			t.Errorf("NewCommand() missing subcommand %q", name)
		}
	}
}

func TestNewCommandExactSubcommands(t *testing.T) {
	cmd := NewCommand()
	if len(cmd.Commands()) != 5 {
		t.Errorf("NewCommand() has %d subcommands, want 5", len(cmd.Commands()))
	}
}

func TestNewCommandSubcommandShort(t *testing.T) {
	cmd := NewCommand()
	for _, sub := range cmd.Commands() {
		if sub.Short == "" {
			t.Errorf("subcommand %q has empty Short", sub.Name())
		}
	}
}
