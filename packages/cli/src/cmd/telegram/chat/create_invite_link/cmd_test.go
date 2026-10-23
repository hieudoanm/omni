package create_invite_link

import "testing"

func TestNewCmd_CreateInviteLink(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "create-invite-link" {
		t.Errorf("Use = %q, want 'create-invite-link'", cmd.Use)
	}
	if cmd.Short != "Create an invite link" {
		t.Errorf("Short = %q", cmd.Short)
	}
	if cmd.RunE == nil {
		t.Error("RunE is nil, expected a function")
	}
}
