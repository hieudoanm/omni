package snapshot

import (
	"testing"
)

func TestNewCmd_Structure(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "snapshot [--url <url>]" {
		t.Errorf("Use = %q, want 'snapshot [--url <url>]'", cmd.Use)
	}
	if cmd.Short != "Take a screenshot of a web page" {
		t.Errorf("Short = %q", cmd.Short)
	}
	for _, name := range []string{"url", "output", "width", "height", "preset", "full-page", "delay", "pdf", "quality", "verbose", "json"} {
		if cmd.Flag(name) == nil {
			t.Errorf("missing flag: --%s", name)
		}
	}
}

func TestNewCmd_RunE_NotNil(t *testing.T) {
	cmd := NewCmd()
	if cmd.RunE == nil {
		t.Fatal("expected RunE to be set")
	}
}
