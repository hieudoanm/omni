package casino

import (
	"testing"
)

func TestNewCommand(t *testing.T) {
	cmd := NewCommand()
	if cmd.Use != "casino" {
		t.Errorf("NewCommand().Use = %q, want %q", cmd.Use, "casino")
	}
	if cmd.Short == "" {
		t.Error("NewCommand().Short should not be empty")
	}
}

func TestNewCommandSubcommands(t *testing.T) {
	cmd := NewCommand()
	subs := cmd.Commands()
	if len(subs) == 0 {
		t.Fatal("NewCommand() has no subcommands")
	}

	names := make(map[string]bool)
	for _, sub := range subs {
		names[sub.Name()] = true
	}

	expected := []string{"blackjack", "poker", "baccarat", "slots", "coin", "dice", "roulette"}
	for _, name := range expected {
		if !names[name] {
			t.Errorf("NewCommand() missing subcommand %q", name)
		}
	}
}

func TestNewCommandExactSubcommands(t *testing.T) {
	cmd := NewCommand()
	subs := cmd.Commands()

	if len(subs) != 7 {
		t.Errorf("NewCommand() has %d subcommands, want 7", len(subs))
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
