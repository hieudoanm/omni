package history

import (
	"github.com/spf13/cobra"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/history/clear"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/history/list"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/history/search"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/history/stats"
)

func NewCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "history",
		Short: "Command execution history",
		Long:  "View and manage CLI and MCP command execution history.",
		RunE:  func(cmd *cobra.Command, args []string) error { return cmd.Help() },
	}
	cmd.AddCommand(list.NewCmd())
	cmd.AddCommand(search.NewCmd())
	cmd.AddCommand(clear.NewCmd())
	cmd.AddCommand(stats.NewCmd())
	cmd.PersistentFlags().BoolP("json", "j", false, "Output in JSON format")
	return cmd
}
