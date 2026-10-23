package metadata

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

func TestRun_ViewMetadata(t *testing.T) {
	cmd := NewCommand()
	cmd.SetArgs([]string{"/nonexistent/file.pdf"})
	err := cmd.Execute()
	if err == nil {
		t.Fatal("expected error for missing file")
	}
}

func TestRun_SetTitle(t *testing.T) {
	cmd := NewCommand()
	cmd.SetArgs([]string{"/nonexistent/file.pdf", "--title", "My Title"})
	err := cmd.Execute()
	if err == nil {
		t.Fatal("expected error for missing file")
	}
}
