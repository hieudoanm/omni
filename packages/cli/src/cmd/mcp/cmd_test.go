package mcp

import (
	"testing"

	"github.com/spf13/cobra"
)

func TestNewCommand(t *testing.T) {
	rootCmd := &cobra.Command{Use: "omni"}
	cmd := NewCommand(rootCmd)
	if cmd == nil {
		t.Fatal("NewCommand() returned nil")
	}
	if cmd.Use != "mcp" {
		t.Errorf("Use = %q, want %q", cmd.Use, "mcp")
	}
	if cmd.Short != "MCP server exposing CLI tools to AI agents" {
		t.Errorf("Short = %q", cmd.Short)
	}
	if cmd.RunE == nil {
		t.Error("expected RunE on root command")
	}

	serveCmd, _, err := cmd.Find([]string{"serve"})
	if err != nil {
		t.Fatal("expected 'serve' subcommand, got error:", err)
	}
	if serveCmd == nil {
		t.Fatal("serve subcommand is nil")
	}
	if serveCmd.Use != "serve" {
		t.Errorf("serve.Use = %q, want %q", serveCmd.Use, "serve")
	}
}

func TestNewCommand_RunE(t *testing.T) {
	rootCmd := &cobra.Command{Use: "omni"}
	cmd := NewCommand(rootCmd)
	err := cmd.RunE(cmd, nil)
	if err != nil {
		t.Fatal("RunE should return nil (help), got:", err)
	}
}
