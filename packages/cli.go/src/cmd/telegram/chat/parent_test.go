package chat

import "testing"

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "chat" {
		t.Errorf("Use = %q, want 'chat'", cmd.Use)
	}
	if cmd.Short != "Manage Telegram chats" {
		t.Errorf("Short = %q", cmd.Short)
	}
	subs := cmd.Commands()
	if len(subs) != 12 {
		t.Fatalf("expected 12 subcommands, got %d", len(subs))
	}
}
