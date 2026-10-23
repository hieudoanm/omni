package text

import (
	"github.com/spf13/cobra"
)

var textContent string
var textX, textY int
var textSize float64
var textColor string
var output string

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "text <file>",
		Short: "Add text overlay to image",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOut, _ := cmd.Flags().GetBool("json")
			return runText(args[0], jsonOut)
		},
	}
	cmd.Flags().StringVarP(&textContent, "text", "t", "", "Text to overlay")
	cmd.Flags().IntVarP(&textX, "x", "x", 10, "X position")
	cmd.Flags().IntVarP(&textY, "y", "y", 10, "Y position")
	cmd.Flags().Float64VarP(&textSize, "size", "s", 24, "Font size")
	cmd.Flags().StringVarP(&textColor, "color", "c", "white", "Text color (name or #hex)")
	cmd.Flags().StringVarP(&output, "output", "o", "", "Output file path")
	return cmd
}
