package edit_invite_link

import "testing"

func TestNewCmd_EditInviteLink(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "edit-invite-link" {
		t.Errorf("Use = %q, want 'edit-invite-link'", cmd.Use)
	}
	if cmd.Short != "Edit an invite link" {
		t.Errorf("Short = %q", cmd.Short)
	}
	if cmd.RunE == nil {
		t.Error("RunE is nil, expected a function")
	}
}
