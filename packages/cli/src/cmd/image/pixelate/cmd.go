package pixelate

import (
	"github.com/spf13/cobra"
)

var pixelSize int
var output string

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "pixelate <file>",
		Short: "Pixelate image",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOut, _ := cmd.Flags().GetBool("json")
			return runPixelate(args[0], jsonOut)
		},
	}
	cmd.Flags().IntVarP(&pixelSize, "size", "s", 10, "Pixel block size")
	cmd.Flags().StringVarP(&output, "output", "o", "", "Output file path")
	return cmd
}
