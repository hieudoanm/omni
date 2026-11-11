package info

import "github.com/spf13/cobra"

func NewCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "info <file>",
		Short: "Show PDF file information",
		Long:  "Display PDF metadata including page count, version, file size, and encryption status.",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			return run(cmd, args[0])
		},
	}
	return cmd
}
