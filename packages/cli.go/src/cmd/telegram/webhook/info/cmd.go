package info

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "info",
		Short:   "Get current webhook info",
		Long:    `Fetch the current webhook configuration.`,
		Example: `  telegram webhook info`,
		RunE:    runE,
	}

	return cmd
}
