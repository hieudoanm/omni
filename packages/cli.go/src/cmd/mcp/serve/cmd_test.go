package serve

import (
	"testing"

	"github.com/spf13/cobra"
)

func TestNewCmd(t *testing.T) {
	rootCmd := &cobra.Command{Use: "omni"}
	cmd := NewCmd(rootCmd)
	if cmd == nil {
		t.Fatal("NewCmd() returned nil")
	}
	if cmd.Use != "serve" {
		t.Errorf("Use = %q, want %q", cmd.Use, "serve")
	}
	if cmd.Short != "Start the MCP server over stdio" {
		t.Errorf("Short = %q", cmd.Short)
	}
	if cmd.RunE == nil {
		t.Error("expected RunE on serve command")
	}
}
