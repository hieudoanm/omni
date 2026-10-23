package snakecase

import (
	"github.com/spf13/cobra"
)

func NewCommand() *cobra.Command {
	return &cobra.Command{
		Use:   "snakecase <text>",
		Short: "Convert text to snake_case",
		Args:  cobra.MaximumNArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			return Run(cmd, args)
		},
	}
}
