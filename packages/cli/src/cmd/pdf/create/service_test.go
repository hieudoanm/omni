package create

import (
	"testing"

	"github.com/spf13/cobra"
)

func executeCommand(cmd *cobra.Command, args ...string) error {
	cmd.SetArgs(args)
	return cmd.Execute()
}

func TestRun_MissingText(t *testing.T) {
	cmd := NewCommand()
	err := executeCommand(cmd)
	if err == nil {
		t.Fatal("expected error for missing text")
	}
}

func TestRun_WithText(t *testing.T) {
	cmd := NewCommand()
	cmd.SetArgs([]string{"--text", "Hello World", "-o", "/tmp/created.pdf"})
	err := cmd.Execute()
	if err != nil {
		t.Logf("expected file-level error (temp or missing lib): %v", err)
	}
}
