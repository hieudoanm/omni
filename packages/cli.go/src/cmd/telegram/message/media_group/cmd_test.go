package media_group

import "testing"

func TestNewCmd_MediaGroup(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "media-group" {
		t.Errorf("Use = %q, want 'media-group'", cmd.Use)
	}
	if cmd.Short != "Send a media group" {
		t.Errorf("Short = %q", cmd.Short)
	}
	if cmd.RunE == nil {
		t.Error("RunE is nil, expected a function")
	}
}
