package compress

import (
	"testing"

	"github.com/spf13/cobra"
)

func executeCommand(cmd *cobra.Command, args ...string) error {
	cmd.SetArgs(args)
	return cmd.Execute()
}

func TestRun_MissingFile(t *testing.T) {
	cmd := NewCommand()
	err := executeCommand(cmd, "/nonexistent/file.pdf")
	if err == nil {
		t.Fatal("expected error for missing file")
	}
}

func TestRun_WithOutput(t *testing.T) {
	cmd := NewCommand()
	cmd.SetArgs([]string{"/nonexistent/file.pdf", "-o", "/tmp/compressed.pdf"})
	err := cmd.Execute()
	if err == nil {
		t.Fatal("expected error for missing file")
	}
}
