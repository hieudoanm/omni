package top10

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "top10",
		Short: "Top 10 players for all rating categories",
		RunE:  runTop10,
	}

	cmd.Flags().Bool("json", false, "Output as JSON")

	return cmd
}
