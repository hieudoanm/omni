package webhook

import "testing"

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "webhook" {
		t.Errorf("Use = %q, want 'webhook'", cmd.Use)
	}
	if cmd.Short != "Manage Telegram webhooks" {
		t.Errorf("Short = %q", cmd.Short)
	}
}
