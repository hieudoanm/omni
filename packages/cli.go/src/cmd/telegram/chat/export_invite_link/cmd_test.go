package export_invite_link

import "testing"

func TestNewCmd_ExportInviteLink(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "export-invite-link" {
		t.Errorf("Use = %q, want 'export-invite-link'", cmd.Use)
	}
	if cmd.Short != "Export primary invite link" {
		t.Errorf("Short = %q", cmd.Short)
	}
	if cmd.RunE == nil {
		t.Error("RunE is nil, expected a function")
	}
}
