package timer

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "timer [--duration <duration>]",
		Short: "Simple countdown timer",
		Long:  `A simple countdown timer with support for seconds, minutes, and hours.`,
		Example: `  timer --duration 30s
  timer --duration 5m
  timer --duration 2h
  timer --duration 90 --json`,
		RunE: func(cmd *cobra.Command, args []string) error {
			durationStr, _ := cmd.Flags().GetString("duration")
			jsonOutput, _ := cmd.Flags().GetBool("json")
			return runTimer(durationStr, jsonOutput)
		},
	}
	cmd.Flags().StringP("duration", "d", "", "Duration (e.g., 30s, 5m, 2h, or bare number for seconds)")
	cmd.MarkFlagRequired("duration")
	cmd.Flags().Bool("json", false, "Output in JSON format")
	return cmd
}
