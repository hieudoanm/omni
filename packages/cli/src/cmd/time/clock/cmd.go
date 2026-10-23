package clock

import (
	"github.com/spf13/cobra"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/time/clock/now"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "clock",
		Short: "Clock and timer utilities",
		Long:  `Display the current date and time in various formats.`,
		Example: `  time clock now
  time clock now --json
  time clock now --format "2006-01-02 15:04:05"`,
		RunE: func(cmd *cobra.Command, args []string) error { return cmd.Help() },
	}
	cmd.AddCommand(now.NewCmd())
	return cmd
}
