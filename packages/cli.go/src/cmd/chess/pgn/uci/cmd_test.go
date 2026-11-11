package uci

import (
	"strings"
	"testing"
)

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "uci" {
		t.Errorf("Use = %q, want 'uci'", cmd.Use)
	}
	if cmd.Flag("pgn-file") == nil {
		t.Error("expected --pgn-file flag")
	}
	if cmd.Flag("pgn") == nil {
		t.Error("expected --pgn flag")
	}
}

func TestRunE_NoInput(t *testing.T) {
	cmd := NewCmd()
	err := cmd.RunE(cmd, nil)
	if err == nil {
		t.Fatal("expected error")
	}
	if !strings.Contains(err.Error(), "provide either --pgn-file or --pgn") {
		t.Errorf("expected 'provide either --pgn-file or --pgn', got %v", err)
	}
}
