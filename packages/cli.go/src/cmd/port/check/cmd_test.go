package check

import (
	"testing"
)

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd == nil {
		t.Fatal("NewCmd() returned nil")
	}
	if cmd.Use != "check [--target <host:port>]" {
		t.Errorf("Use = %q", cmd.Use)
	}
	if cmd.Flag("target") == nil {
		t.Error("expected --target flag")
	}
	if cmd.Flag("timeout") == nil {
		t.Error("expected --timeout flag")
	}
}

func TestCheckCmd_RunE_InvalidHostPort(t *testing.T) {
	cmd := NewCmd()
	cmd.Flags().Set("target", "invalid-format")

	err := cmd.RunE(cmd, []string{})
	if err == nil {
		t.Fatal("expected error for invalid host:port format")
	}
}

func TestCheckCmd_RunE_Success(t *testing.T) {
	cmd := NewCmd()
	cmd.Flags().Set("target", "127.0.0.1:1")
	cmd.Flags().Set("timeout", "1")

	err := cmd.RunE(cmd, []string{})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
}

func TestCheckCmd_RunE_JSONOutput(t *testing.T) {
	cmd := NewCmd()
	cmd.Flags().Set("target", "127.0.0.1:1")
	cmd.Flags().Set("timeout", "1")
	cmd.Flags().Set("json", "true")

	err := cmd.RunE(cmd, []string{})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
}

func TestCheckCmd_RunE_WithTimeout(t *testing.T) {
	cmd := NewCmd()
	cmd.Flags().Set("target", "127.0.0.1:1")
	cmd.Flags().Set("timeout", "0")

	err := cmd.RunE(cmd, []string{})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
}
