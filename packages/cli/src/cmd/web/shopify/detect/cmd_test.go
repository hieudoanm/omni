package detect

import (
	"testing"
)

func TestNewCmd_Structure(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "detect [url]" {
		t.Errorf("Use = %q, want 'detect [url]'", cmd.Use)
	}
	if cmd.Short != "Detect if a website is using Shopify" {
		t.Errorf("Short = %q", cmd.Short)
	}
	if cmd.Flag("verbose") == nil {
		t.Error("expected --verbose flag")
	}
	if cmd.Flag("json") == nil {
		t.Error("expected --json flag")
	}
}
