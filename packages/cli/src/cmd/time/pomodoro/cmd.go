package pomodoro

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "pomodoro",
		Short: "Start a Pomodoro timer TUI session",
		Long:  `Start a Pomodoro timer with configurable work and rest durations. Uses a simple terminal UI.`,
		Example: `  pomodoro
  pomodoro --work 30 --rest 5`,
		RunE: func(cmd *cobra.Command, args []string) error {
			work, _ := cmd.Flags().GetInt("work")
			rest, _ := cmd.Flags().GetInt("rest")
			return runPomodoro(work, rest)
		},
	}
	cmd.Flags().Int("work", 25, "Work duration in minutes")
	cmd.Flags().Int("rest", 5, "Rest duration in minutes")
	return cmd
}
