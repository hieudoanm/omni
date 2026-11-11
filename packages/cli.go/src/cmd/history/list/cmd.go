package list

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var limit int
	cmd := &cobra.Command{
		Use:   "list",
		Short: "List recent history entries",
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")
			return runList(limit, jsonOutput)
		},
	}
	cmd.Flags().IntVarP(&limit, "limit", "n", 20, "max entries to show")
	return cmd
}
