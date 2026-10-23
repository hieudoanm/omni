package trim

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "trim <file>",
		Short: "Trim video by start time and duration/end time",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			return runTrim(args[0])
		},
	}
	cmd.Flags().StringVarP(&start, "start", "s", "00:00:00", "Start time (HH:MM:SS)")
	cmd.Flags().StringVarP(&duration, "duration", "d", "", "Duration (HH:MM:SS)")
	cmd.Flags().StringVarP(&to, "to", "t", "", "End time (HH:MM:SS)")
	cmd.Flags().StringVarP(&output, "output", "o", "", "Output file path")
	return cmd
}
