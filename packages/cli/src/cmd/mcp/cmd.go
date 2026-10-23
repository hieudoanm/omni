package mcp

import (
	"github.com/hieudoanm/omni/packages/cli/src/cmd/mcp/serve"
	"github.com/spf13/cobra"
)

func NewCommand(rootCmd *cobra.Command) *cobra.Command {
	cmd := &cobra.Command{
		Use:   "mcp",
		Short: "MCP server exposing CLI tools to AI agents",
		Long: `Run an MCP (Model Context Protocol) server over stdio.

Exposes all omni CLI commands as MCP tools that AI agents can discover and call.
Each CLI command becomes a tool named with dot notation (e.g., file.read, search.files).

Protocol: JSON-RPC 2.0 over stdio (newline-delimited JSON)`,
		Example: `  omni mcp serve`,
		RunE: func(cmd *cobra.Command, args []string) error {
			return cmd.Help()
		},
	}
	cmd.AddCommand(serve.NewCmd(rootCmd))
	return cmd
}
