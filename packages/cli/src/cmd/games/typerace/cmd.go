package typerace

import (
	"github.com/spf13/cobra"
)

func NewCommand() *cobra.Command {
	return &cobra.Command{
		Use:   "typerace",
		Short: "Measure your typing speed and accuracy",
		Long:  `Type a randomly selected passage as fast and accurately as you can. Your WPM and accuracy are displayed at the end.`,
		RunE: func(cmd *cobra.Command, args []string) error {
			return runTyperace()
		},
	}
}
