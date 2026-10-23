package docsify

import (
	"testing"
)

func TestNewCommand(t *testing.T) {
	cmd := NewCommand()
	if cmd == nil {
		t.Fatal("NewCommand returned nil")
	}

	if cmd.Use != "docsify" {
		t.Errorf("expected Use = %q, got %q", "docsify", cmd.Use)
	}

	if cmd.RunE == nil {
		t.Error("RunE should not be nil")
	}

	if cmd.Example == "" {
		t.Error("Example should not be empty")
	}

	jsonFlag := cmd.PersistentFlags().Lookup("json")
	if jsonFlag == nil {
		t.Error("expected --json persistent flag")
	}

	expectedSubs := []string{"cobra", "obsidian", "scan", "tree"}
	actual := make(map[string]bool)
	for _, sub := range cmd.Commands() {
		actual[sub.Name()] = true
	}

	for _, name := range expectedSubs {
		if !actual[name] {
			t.Errorf("expected subcommand %q not found", name)
		}
	}

	if len(cmd.Commands()) != len(expectedSubs) {
		t.Errorf("expected %d subcommands, got %d", len(expectedSubs), len(cmd.Commands()))
	}
}
