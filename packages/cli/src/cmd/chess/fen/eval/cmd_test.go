package eval

import (
	"strings"
	"testing"
)

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "eval" {
		t.Errorf("Use = %q, want 'eval'", cmd.Use)
	}
	if cmd.Flag("fen") == nil {
		t.Error("expected --fen flag")
	}
	if cmd.Flag("multipv") == nil {
		t.Error("expected --multipv flag")
	}
}

func TestRunE_NoFen(t *testing.T) {
	cmd := NewCmd()
	err := cmd.RunE(cmd, nil)
	if err == nil {
		t.Fatal("expected error")
	}
	if !strings.Contains(err.Error(), "--fen is required") {
		t.Errorf("expected '--fen is required', got %v", err)
	}
}
