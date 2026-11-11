package tomp3

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "to-mp3 <file>",
		Short: "Extract audio as MP3 with quality control",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			return runToMp3(args[0])
		},
	}
	cmd.Flags().IntVarP(&quality, "quality", "q", 2, "VBR quality 0-9 (0 = best)")
	cmd.Flags().StringVarP(&output, "output", "o", "", "Output file path")
	return cmd
}
