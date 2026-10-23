package split

import (
	"github.com/spf13/cobra"
)

var splitRows, splitCols int
var outputDir string

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "split <file>",
		Short: "Split image into tiles",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOut, _ := cmd.Flags().GetBool("json")
			return runSplit(args[0], jsonOut)
		},
	}
	cmd.Flags().IntVarP(&splitRows, "rows", "r", 2, "Number of rows")
	cmd.Flags().IntVarP(&splitCols, "cols", "c", 2, "Number of columns")
	cmd.Flags().StringVarP(&outputDir, "output", "o", "", "Output directory")
	return cmd
}
