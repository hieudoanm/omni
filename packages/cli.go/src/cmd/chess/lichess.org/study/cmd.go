package study

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "study [study-id]",
		Short: "Export a study as PGN",
		Long:  `Fetch a Lichess study and output its PGN.`,
		Args:  cobra.ExactArgs(1),
		RunE:  runStudy,
	}

	cmd.Flags().Bool("json", false, "Output as JSON")

	return cmd
}
