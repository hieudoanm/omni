package togif

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "to-gif <file>",
		Short: "Convert video to animated GIF",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			return runToGif(args[0])
		},
	}
	cmd.Flags().IntVarP(&fps, "fps", "r", 10, "Output frame rate")
	cmd.Flags().IntVarP(&width, "width", "w", 480, "Output width (height auto-scales)")
	cmd.Flags().StringVarP(&output, "output", "o", "", "Output file path")
	return cmd
}
