package border

import (
	"github.com/spf13/cobra"
)

var borderWidth int
var borderColor string
var output string

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "border <file>",
		Short: "Add border around image",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOut, _ := cmd.Flags().GetBool("json")
			return runBorder(args[0], jsonOut)
		},
	}
	cmd.Flags().IntVarP(&borderWidth, "width", "w", 10, "Border width in pixels")
	cmd.Flags().StringVarP(&borderColor, "color", "c", "black", "Border color (name or #hex)")
	cmd.Flags().StringVarP(&output, "output", "o", "", "Output file path")
	return cmd
}
