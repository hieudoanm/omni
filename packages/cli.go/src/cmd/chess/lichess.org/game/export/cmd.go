package export

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "export [game-id]",
		Short: "Export a game in JSON format",
		Args:  cobra.ExactArgs(1),
		RunE:  runExport,
	}

	cmd.Flags().Bool("json", false, "Output as JSON")

	return cmd
}
