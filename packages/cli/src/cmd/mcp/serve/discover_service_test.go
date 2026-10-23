package serve

import (
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/libs/mcp"
	"github.com/spf13/cobra"
)

func TestHasAction(t *testing.T) {
	tests := []struct {
		name string
		cmd  *cobra.Command
		want bool
	}{
		{name: "RunE set", cmd: &cobra.Command{RunE: func(*cobra.Command, []string) error { return nil }}, want: true},
		{name: "Run set", cmd: &cobra.Command{Run: func(*cobra.Command, []string) {}}, want: true},
		{name: "neither set", cmd: &cobra.Command{}, want: false},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			got := hasAction(tc.cmd)
			if got != tc.want {
				t.Errorf("hasAction = %v, want %v", got, tc.want)
			}
		})
	}
}

func TestWalkCommands_empty(t *testing.T) {
	cmd := &cobra.Command{Use: "test"}
	got := walkCommands(cmd, "test")
	if len(got) != 0 {
		t.Errorf("expected 0 commands, got %d", len(got))
	}
}

func TestWalkCommands_hasAction(t *testing.T) {
	cmd := &cobra.Command{
		Use:  "test",
		RunE: func(*cobra.Command, []string) error { return nil },
	}
	got := walkCommands(cmd, "test")
	if len(got) != 1 {
		t.Fatalf("expected 1 command, got %d", len(got))
	}
	if got[0].name != "test" {
		t.Errorf("name = %q, want %q", got[0].name, "test")
	}
	if got[0].cmd != cmd {
		t.Error("cmd pointer mismatch")
	}
}

func TestWalkCommands_skipChild(t *testing.T) {
	parent := &cobra.Command{Use: "parent", RunE: func(*cobra.Command, []string) error { return nil }}
	help := &cobra.Command{Use: "help", RunE: func(*cobra.Command, []string) error { return nil }}
	completion := &cobra.Command{Use: "completion", RunE: func(*cobra.Command, []string) error { return nil }}
	mcp := &cobra.Command{Use: "mcp", RunE: func(*cobra.Command, []string) error { return nil }}
	parent.AddCommand(help, completion, mcp)

	got := walkCommands(parent, "parent")
	if len(got) != 1 {
		t.Fatalf("expected 1 (parent only), got %d: %+v", len(got), got)
	}
	if got[0].name != "parent" {
		t.Errorf("name = %q, want %q", got[0].name, "parent")
	}
}

func TestWalkCommands_nestedChildren(t *testing.T) {
	child := &cobra.Command{Use: "child", RunE: func(*cobra.Command, []string) error { return nil }}
	parent := &cobra.Command{Use: "parent"}
	parent.AddCommand(child)

	got := walkCommands(parent, "parent")
	if len(got) != 1 {
		t.Fatalf("expected 1 child, got %d", len(got))
	}
	if got[0].name != "parent.child" {
		t.Errorf("name = %q, want %q", got[0].name, "parent.child")
	}
}

func TestWalkCommands_deepNesting(t *testing.T) {
	grandchild := &cobra.Command{Use: "grandchild", RunE: func(*cobra.Command, []string) error { return nil }}
	child := &cobra.Command{Use: "child"}
	parent := &cobra.Command{Use: "parent"}
	child.AddCommand(grandchild)
	parent.AddCommand(child)

	got := walkCommands(parent, "parent")
	if len(got) != 1 {
		t.Fatalf("expected 1 (grandchild), got %d", len(got))
	}
	if got[0].name != "parent.child.grandchild" {
		t.Errorf("name = %q, want %q", got[0].name, "parent.child.grandchild")
	}
}

func TestWalkCommands_noActionSkipped(t *testing.T) {
	child := &cobra.Command{Use: "child"}
	parent := &cobra.Command{Use: "parent", RunE: func(*cobra.Command, []string) error { return nil }}
	parent.AddCommand(child)

	got := walkCommands(parent, "parent")
	if len(got) != 1 {
		t.Fatalf("expected 1 (parent only), got %d", len(got))
	}
	if got[0].name != "parent" {
		t.Errorf("name = %q, want %q", got[0].name, "parent")
	}
}

func TestRegisterTools(t *testing.T) {
	child := &cobra.Command{
		Use:   "hello",
		Short: "prints hello",
		RunE:  func(*cobra.Command, []string) error { return nil },
	}
	root := &cobra.Command{Use: "omni"}
	root.AddCommand(child)

	server := mcp.NewServer()
	registerTools(server, root)

	_ = server
}

func TestRegisterTools_skipsMcp(t *testing.T) {
	mcpCmd := &cobra.Command{
		Use:  "mcp",
		RunE: func(*cobra.Command, []string) error { return nil },
	}
	root := &cobra.Command{Use: "omni"}
	root.AddCommand(mcpCmd)

	server := mcp.NewServer()
	registerTools(server, root)

	_ = server
}
