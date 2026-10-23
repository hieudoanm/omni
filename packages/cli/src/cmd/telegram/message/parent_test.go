package message

import "testing"

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "message" {
		t.Errorf("Use = %q, want 'message'", cmd.Use)
	}
	if cmd.Short != "Send Telegram messages" {
		t.Errorf("Short = %q", cmd.Short)
	}
	subs := cmd.Commands()
	if len(subs) != 13 {
		t.Fatalf("expected 13 subcommands, got %d", len(subs))
	}
	expected := []string{"animation", "audio", "copy", "delete", "document", "edit", "forward", "media-group", "photo", "send", "video", "video-note", "voice"}
	for i, name := range expected {
		if subs[i].Name() != name {
			t.Errorf("subcommand[%d] = %q, want %q", i, subs[i].Name(), name)
		}
	}
}
