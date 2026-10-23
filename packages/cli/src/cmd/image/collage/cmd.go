package collage

import (
	"github.com/spf13/cobra"
)

var collageRows, collageCols int
var output string

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "collage <files...>",
		Short: "Create collage from multiple images",
		Args:  cobra.MinimumNArgs(2),
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOut, _ := cmd.Flags().GetBool("json")
			return runCollage(args, jsonOut)
		},
	}
	cmd.Flags().IntVarP(&collageRows, "rows", "r", 0, "Number of rows (0 for auto)")
	cmd.Flags().IntVarP(&collageCols, "cols", "c", 2, "Number of columns")
	cmd.Flags().StringVarP(&output, "output", "o", "", "Output file path")
	return cmd
}
