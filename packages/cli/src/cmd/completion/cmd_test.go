package completion

import (
	"bytes"
	"io"
	"os"
	"strings"
	"testing"

	"github.com/spf13/cobra"
)

func newRootCmd() *cobra.Command {
	return &cobra.Command{Use: "omni"}
}

func TestNewCommand(t *testing.T) {
	root := newRootCmd()
	cmd := NewCommand(root)
	if cmd.Use != "completion [--shell <shell>]" {
		t.Errorf("Use = %q, want 'completion [--shell <shell>]'", cmd.Use)
	}
	if cmd.Short != "Generate shell completion scripts" {
		t.Errorf("Short = %q, want 'Generate shell completion scripts'", cmd.Short)
	}
	if cmd.Long != "Generate shell completion scripts for bash, zsh, or fish." {
		t.Errorf("Long = %q", cmd.Long)
	}
	if cmd.RunE == nil {
		t.Error("RunE is nil, expected a function")
	}
	flag := cmd.Flag("shell")
	if flag == nil {
		t.Error("expected --shell flag, got nil")
	}
}

func TestNewCommand_RunE_Bash(t *testing.T) {
	root := newRootCmd()
	cmd := NewCommand(root)
	cmd.Flags().Set("shell", "bash")
	output := captureCompletionOutput(func() {
		if err := cmd.RunE(cmd, nil); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "bash") {
		t.Errorf("expected bash completion output, got %q", output)
	}
}

func TestNewCommand_RunE_Zsh(t *testing.T) {
	root := newRootCmd()
	cmd := NewCommand(root)
	cmd.Flags().Set("shell", "zsh")
	output := captureCompletionOutput(func() {
		if err := cmd.RunE(cmd, nil); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "compdef") {
		t.Errorf("expected zsh completion output, got %q", output)
	}
}

func TestNewCommand_RunE_Fish(t *testing.T) {
	root := newRootCmd()
	cmd := NewCommand(root)
	cmd.Flags().Set("shell", "fish")
	output := captureCompletionOutput(func() {
		if err := cmd.RunE(cmd, nil); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "complete") {
		t.Errorf("expected fish completion output, got %q", output)
	}
}

func TestNewCommand_RunE_Unsupported(t *testing.T) {
	root := newRootCmd()
	cmd := NewCommand(root)
	cmd.Flags().Set("shell", "tcsh")
	err := cmd.RunE(cmd, nil)
	if err == nil {
		t.Fatal("expected error for unsupported shell")
	}
	if !strings.Contains(err.Error(), "unsupported") {
		t.Errorf("expected unsupported error, got %v", err)
	}
}

func captureCompletionOutput(fn func()) string {
	old := os.Stdout
	r, w, _ := os.Pipe()
	os.Stdout = w

	out := make(chan string)
	go func() {
		var buf bytes.Buffer
		io.Copy(&buf, r)
		out <- buf.String()
	}()

	fn()
	w.Close()
	result := <-out
	os.Stdout = old
	return result
}
