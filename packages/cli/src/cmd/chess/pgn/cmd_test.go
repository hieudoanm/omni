package pgn

import (
	"testing"
)

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "pgn" {
		t.Errorf("Use = %q, want 'pgn'", cmd.Use)
	}
	subs := cmd.Commands()
	if len(subs) != 2 {
		t.Fatalf("expected 2 subcommands, got %d", len(subs))
	}
	names := map[string]bool{}
	for _, s := range subs {
		names[s.Name()] = true
	}
	if !names["fen"] {
		t.Error("expected subcommand 'fen'")
	}
	if !names["uci"] {
		t.Error("expected subcommand 'uci'")
	}
}
