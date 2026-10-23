package battery

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "battery",
		Short: "Show battery status",
		Long:  `Display battery percentage, charging state, and time remaining.`,
		Example: `  system battery
  system battery --json`,
		RunE: func(cmd *cobra.Command, args []string) error {
			return batteryRun()
		},
	}

	cmd.Flags().BoolVarP(&jsonOutput, "json", "j", false, "Output in JSON format")
	return cmd
}
