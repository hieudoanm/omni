package tv

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "tv",
		Short: "Lichess TV channels",
		RunE:  runTv,
	}

	cmd.Flags().Bool("json", false, "Output as JSON")

	return cmd
}
