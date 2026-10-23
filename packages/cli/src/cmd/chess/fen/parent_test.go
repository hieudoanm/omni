package fen

import (
	"testing"
)

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "fen" {
		t.Errorf("Use = %q, want 'fen'", cmd.Use)
	}
	subs := cmd.Commands()
	if len(subs) != 2 {
		t.Fatalf("expected 2 subcommands, got %d", len(subs))
	}
	names := map[string]bool{}
	for _, s := range subs {
		names[s.Name()] = true
	}
	if !names["eval"] {
		t.Error("expected subcommand 'eval'")
	}
	if !names["svg"] {
		t.Error("expected subcommand 'svg'")
	}
	if cmd.Flag("list") == nil {
		t.Error("expected --list flag")
	}
}
