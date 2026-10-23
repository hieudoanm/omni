package set_thumbnail

import "testing"

func TestNewCmd_SetThumbnail(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "set-thumbnail" {
		t.Errorf("Use = %q, want 'set-thumbnail'", cmd.Use)
	}
	if cmd.Short != "Set sticker set thumbnail" {
		t.Errorf("Short = %q", cmd.Short)
	}
	if cmd.RunE == nil {
		t.Error("RunE is nil, expected a function")
	}
}
