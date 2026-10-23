package shopify

import (
	"testing"
)

func TestNewCmd_Structure(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "shopify" {
		t.Errorf("Use = %q, want 'shopify'", cmd.Use)
	}
	if cmd.Short != "Shopify detection and analysis tools" {
		t.Errorf("Short = %q", cmd.Short)
	}
	subs := cmd.Commands()
	if len(subs) != 1 || subs[0].Name() != "detect" {
		t.Errorf("expected subcommand 'detect', got %v", cmd.Commands())
	}
}
