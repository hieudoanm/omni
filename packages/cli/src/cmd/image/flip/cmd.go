package flip

import (
	"github.com/spf13/cobra"
)

var horizontal, vertical bool
var output string

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "flip <file>",
		Short: "Flip/mirror image",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOut, _ := cmd.Flags().GetBool("json")
			return runFlip(args[0], jsonOut)
		},
	}
	cmd.Flags().BoolVarP(&horizontal, "horizontal", "H", false, "Flip horizontally")
	cmd.Flags().BoolVarP(&vertical, "vertical", "V", false, "Flip vertically")
	cmd.Flags().StringVarP(&output, "output", "o", "", "Output file path")
	return cmd
}
