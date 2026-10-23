package time

import (
	"github.com/hieudoanm/omni/packages/cli/src/cmd/time/age"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/time/clock"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/time/cron"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/time/epoch"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/time/pomodoro"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/time/stopwatch"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/time/timer"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/time/until"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/time/world"
	"github.com/spf13/cobra"
)

func NewCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "time",
		Short: "Time and scheduling tools",
		Long:  `Current time, pomodoro timer, countdown timer, epoch conversion, and cron expression utilities.`,
		Example: `  time clock now
  time age --date 1990-01-15
  time epoch 1718100000
  time cron --expression "*/15 * * * *"
  time timer --duration 30s
  time pomodoro
  time world ny london tokyo`,
		RunE: func(cmd *cobra.Command, args []string) error { return cmd.Help() },
	}
	cmd.AddCommand(
		clock.NewCmd(),
		cron.NewCmd(),
		epoch.NewCmd(),
		pomodoro.NewCmd(),
		timer.NewCmd(),
		until.NewCmd(),
		world.NewCmd(),
		age.NewCmd(),
		stopwatch.NewCmd(),
	)
	cmd.PersistentFlags().BoolP("json", "j", false, "Output in JSON format")
	return cmd
}
