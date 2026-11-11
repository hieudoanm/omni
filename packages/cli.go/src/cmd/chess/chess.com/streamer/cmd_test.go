package streamer

import (
	"testing"
)

func TestNewCmd_UseShort(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "streamer" {
		t.Errorf("expected Use 'streamer', got %q", cmd.Use)
	}
	if cmd.Short != "Show Chess.com streamers" {
		t.Errorf("expected Short 'Show Chess.com streamers', got %q", cmd.Short)
	}
}
