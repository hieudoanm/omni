package info

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "info",
		Short: "Show system information",
		Long:  `Display OS, architecture, CPU count, uptime, and memory.`,
		Example: `  system info
  system info --json`,
		RunE: func(cmd *cobra.Command, args []string) error {
			return infoRun()
		},
	}

	cmd.Flags().BoolVarP(&jsonOutput, "json", "j", false, "Output in JSON format")
	return cmd
}
