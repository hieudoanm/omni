package pre_checkout

import "testing"

func TestNewCmd_PreCheckout(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "pre-checkout" {
		t.Errorf("Use = %q, want 'pre-checkout'", cmd.Use)
	}
	if cmd.Short != "Answer a pre-checkout query" {
		t.Errorf("Short = %q", cmd.Short)
	}
	if cmd.RunE == nil {
		t.Error("RunE is nil, expected a function")
	}
}
