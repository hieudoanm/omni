package define

import (
	"strings"
	"testing"
)

func TestNewDefineCmd_Metadata(t *testing.T) {
	cmd := NewCmd()
	if cmd == nil {
		t.Fatal("NewCmd() returned nil")
	}
	if cmd.Use != "define [--word <word>]" {
		t.Errorf("Use = %q", cmd.Use)
	}
	if cmd.Short == "" {
		t.Error("Short should not be empty")
	}
	if cmd.Long == "" {
		t.Error("Long should not be empty")
	}
	if cmd.Example == "" {
		t.Error("Example should not be empty")
	}
	if cmd.RunE == nil {
		t.Fatal("RunE should not be nil")
	}
	if cmd.Flag("json") == nil {
		t.Error("expected --json flag")
	}
	if cmd.Flag("word") == nil {
		t.Error("expected --word flag")
	}
}

func TestNewDefineCmd_RunE_EmptyWord(t *testing.T) {
	cmd := NewCmd()
	err := cmd.RunE(cmd, nil)
	if err == nil {
		t.Fatal("expected error for empty word")
	}
	if !strings.Contains(err.Error(), "word cannot be empty") {
		t.Errorf("error = %q, want 'word cannot be empty'", err)
	}
}
