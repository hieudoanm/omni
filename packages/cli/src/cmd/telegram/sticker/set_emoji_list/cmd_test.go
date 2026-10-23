package set_emoji_list

import "testing"

func TestNewCmd_SetEmojiList(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "set-emoji-list" {
		t.Errorf("Use = %q, want 'set-emoji-list'", cmd.Use)
	}
	if cmd.Short != "Set sticker emoji list" {
		t.Errorf("Short = %q", cmd.Short)
	}
	if cmd.RunE == nil {
		t.Error("RunE is nil, expected a function")
	}
}
