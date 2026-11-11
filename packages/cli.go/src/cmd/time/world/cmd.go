package world

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "world [zone1 zone2 ...]",
		Short: "Display current time in multiple timezones",
		Long:  `Display the current time in common timezones around the world.`,
		Example: `  world
  world london tokyo
  world ny london hcmc`,
		RunE: func(cmd *cobra.Command, args []string) error {
			return runWorld(args)
		},
	}
	return cmd
}
