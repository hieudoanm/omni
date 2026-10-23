package until

import (
	"fmt"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/time/internal"
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "until [--time <datetime>]",
		Short: "Countdown to a specific date/time",
		Long: `Display a countdown from now until a specified future date and time.
Supports multiple date formats.`,
		Example: `  until --time "2027-01-01"
  until --time "2027-01-01 12:00:00"
  until --time "2027-01-01T00:00:00Z"`,
		RunE: func(cmd *cobra.Command, args []string) error {
			timeStr, _ := cmd.Flags().GetString("time")

			target, err := internal.ParseDatetime(timeStr)
			if err != nil {
				return fmt.Errorf("invalid time: %w", err)
			}
			return printCountdown(target)
		},
	}
	cmd.Flags().StringP("time", "t", "", "Target date/time (e.g., 2027-01-01)")
	cmd.MarkFlagRequired("time")
	return cmd
}
