package dominant

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var topN int
	cmd := &cobra.Command{
		Use:   "dominant <file>",
		Short: "Extract dominant colours from an image",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			return runDominant(args[0], topN)
		},
	}
	cmd.Flags().IntVarP(&topN, "top", "n", 5, "Number of dominant colours to extract")
	return cmd
}
