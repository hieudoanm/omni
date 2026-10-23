package sticker

import "testing"

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "sticker" {
		t.Errorf("Use = %q, want 'sticker'", cmd.Use)
	}
	if cmd.Short != "Send stickers" {
		t.Errorf("Short = %q", cmd.Short)
	}
	subs := cmd.Commands()
	if len(subs) != 9 {
		t.Fatalf("expected 9 subcommands, got %d", len(subs))
	}
}
