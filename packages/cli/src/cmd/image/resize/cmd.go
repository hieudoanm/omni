package resize

import (
	"github.com/spf13/cobra"
)

var width, height int
var fit string
var output string

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "resize <file>",
		Short: "Resize image dimensions",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOut, _ := cmd.Flags().GetBool("json")
			return runResize(args[0], jsonOut)
		},
	}
	cmd.Flags().IntVarP(&width, "width", "w", 0, "Target width")
	cmd.Flags().IntVarP(&height, "height", "h", 0, "Target height")
	cmd.Flags().StringVarP(&fit, "fit", "f", "contain", "Fit mode (contain, cover, fill, none)")
	cmd.Flags().StringVarP(&output, "output", "o", "", "Output file path")
	return cmd
}
