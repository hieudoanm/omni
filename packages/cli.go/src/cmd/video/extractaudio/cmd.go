package extractaudio

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "extract-audio <file>",
		Short: "Extract audio track from video",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			return runExtractAudio(args[0])
		},
	}
	cmd.Flags().StringVarP(&audioFormat, "format", "f", "mp3", "Audio format (mp3, wav, flac, ogg, m4a)")
	cmd.Flags().StringVarP(&output, "output", "o", "", "Output file path")
	return cmd
}
