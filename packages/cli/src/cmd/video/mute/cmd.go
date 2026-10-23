package mute

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "mute <file>",
		Short: "Remove audio track from video",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			return runMute(args[0])
		},
	}
	cmd.Flags().StringVarP(&output, "output", "o", "", "Output file path")
	return cmd
}
