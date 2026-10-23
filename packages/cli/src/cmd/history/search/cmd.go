package search

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var limit int
	cmd := &cobra.Command{
		Use:   "search <query>",
		Short: "Search history entries",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")
			return runSearch(args[0], limit, jsonOutput)
		},
	}
	cmd.Flags().IntVarP(&limit, "limit", "n", 20, "max entries to show")
	return cmd
}
