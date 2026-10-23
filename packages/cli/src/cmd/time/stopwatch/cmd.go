package stopwatch

import (
	"context"

	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "stopwatch",
		Short: "Measure elapsed time like a stopwatch",
		Long:  `A simple stopwatch that measures elapsed time until Ctrl+C is pressed.`,
		Example: `  stopwatch
  stopwatch --json`,
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")
			ctx := cmd.Context()
			if ctx == nil {
				ctx = context.Background()
			}
			return runStopwatch(ctx, jsonOutput)
		},
	}
	cmd.Flags().Bool("json", false, "Output in JSON format")
	return cmd
}
