package resize

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "resize <file>",
		Short: "Resize video dimensions",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			return runResize(args[0])
		},
	}
	cmd.Flags().IntVarP(&width, "width", "w", -1, "Output width (-1 = auto)")
	cmd.Flags().IntVarP(&height, "height", "h", 720, "Output height")
	cmd.Flags().StringVarP(&output, "output", "o", "", "Output file path")
	return cmd
}
