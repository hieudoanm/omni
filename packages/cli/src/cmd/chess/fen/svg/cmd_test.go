package svg

import (
	"strings"
	"testing"
)

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "svg" {
		t.Errorf("Use = %q, want 'svg'", cmd.Use)
	}
	if cmd.Flag("fen") == nil {
		t.Error("expected --fen flag")
	}
	if cmd.Flag("out") == nil {
		t.Error("expected --out flag")
	}
}

func TestRunE_NoFen(t *testing.T) {
	cmd := NewCmd()
	err := cmd.RunE(cmd, nil)
	if err == nil {
		t.Fatal("expected error")
	}
	if !strings.Contains(err.Error(), "provide a FEN string") {
		t.Errorf("expected 'provide a FEN string', got %v", err)
	}
}
