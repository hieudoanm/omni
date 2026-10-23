package crop

import (
	"github.com/spf13/cobra"
)

var cropX, cropY, cropW, cropH int
var center bool
var output string

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "crop <file>",
		Short: "Crop image",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOut, _ := cmd.Flags().GetBool("json")
			return runCrop(args[0], jsonOut)
		},
	}
	cmd.Flags().IntVarP(&cropX, "x", "x", 0, "Crop X offset")
	cmd.Flags().IntVarP(&cropY, "y", "y", 0, "Crop Y offset")
	cmd.Flags().IntVarP(&cropW, "width", "w", 0, "Crop width")
	cmd.Flags().IntVarP(&cropH, "height", "h", 0, "Crop height")
	cmd.Flags().BoolVarP(&center, "center", "c", false, "Crop from center")
	cmd.Flags().StringVarP(&output, "output", "o", "", "Output file path")
	return cmd
}
