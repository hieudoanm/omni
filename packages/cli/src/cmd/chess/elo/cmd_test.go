package elo

import (
	"testing"
)

func TestCommands_Use(t *testing.T) {
	root := NewCmd()
	if root.Use != "elo" {
		t.Errorf("expected root Use 'elo', got %q", root.Use)
	}

	subs := root.Commands()
	expected := map[string]bool{
		"expected-score": false,
		"rating-change":  false,
		"tournament":     false,
		"tpr":            false,
		"required-score": false,
		"rating-diff":    false,
	}
	if len(subs) != len(expected) {
		t.Fatalf("expected %d subcommands, got %d", len(expected), len(subs))
	}
	for _, sub := range subs {
		if _, ok := expected[sub.Use]; !ok {
			t.Errorf("unexpected subcommand %q", sub.Use)
		}
		expected[sub.Use] = true
	}
	for name, found := range expected {
		if !found {
			t.Errorf("missing subcommand %q", name)
		}
	}
}
