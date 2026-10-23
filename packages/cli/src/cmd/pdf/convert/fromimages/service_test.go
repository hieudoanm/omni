package fromimages

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
	err := executeCommand(cmd, "/nonexistent/image.png")
	if err == nil {
		t.Fatal("expected error for missing file")
	}
}

func TestRun_WithOutput(t *testing.T) {
	cmd := NewCommand()
	cmd.SetArgs([]string{"/nonexistent/image.png", "-o", "/tmp/out.pdf"})
	err := cmd.Execute()
	if err == nil {
		t.Fatal("expected error for missing file")
	}
}
