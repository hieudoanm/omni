package video

import "testing"

func TestNewCmd_Video(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "video" {
		t.Errorf("Use = %q, want 'video'", cmd.Use)
	}
	if cmd.Short != "Send a video" {
		t.Errorf("Short = %q", cmd.Short)
	}
	if cmd.RunE == nil {
		t.Error("RunE is nil, expected a function")
	}
}
