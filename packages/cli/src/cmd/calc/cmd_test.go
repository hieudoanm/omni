package calc

import (
	"testing"

	"github.com/spf13/cobra"
)

func TestCalcCommand(t *testing.T) {
	cmd := NewCommand()
	if cmd.Use != "calc" {
		t.Errorf("Use = %q, want %q", cmd.Use, "calc")
	}
	if cmd.Short != "Financial and utility calculators" {
		t.Errorf("Short = %q, want %q", cmd.Short, "Financial and utility calculators")
	}
	j := cmd.PersistentFlags().Lookup("json")
	if j == nil {
		t.Error("expected --json persistent flag")
	}
}

func TestCalcSubcommands(t *testing.T) {
	cmd := NewCommand()
	expected := []string{
		"tax", "compound", "currency", "loan", "discount", "tip", "bmi",
		"base", "unit", "percent", "mortgage", "date", "eval", "stats",
		"factorial", "random", "prime", "gcd", "lcm", "age",
	}
	for _, name := range expected {
		if _, _, err := cmd.Find([]string{name}); err != nil {
			t.Errorf("missing subcommand %q", name)
		}
	}
	subs := cmd.Commands()
	if len(subs) != len(expected) {
		t.Errorf("expected %d subcommands, got %d", len(expected), len(subs))
	}
}

func TestCalcSubcommandNoDuplicates(t *testing.T) {
	cmd := NewCommand()
	seen := make(map[string]*cobra.Command)
	for _, sub := range cmd.Commands() {
		if existing, ok := seen[sub.Name()]; ok {
			t.Errorf("duplicate subcommand %q (already registered at %v)", sub.Name(), existing)
		}
		seen[sub.Name()] = sub
	}
}
