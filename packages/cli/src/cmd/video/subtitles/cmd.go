package subtitles

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "subtitles <file>",
		Short: "Extract or burn subtitles",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			return runSubtitles(args[0])
		},
	}
	cmd.Flags().StringVarP(&action, "action", "a", "extract", "Action: extract or burn")
	cmd.Flags().StringVarP(&lang, "lang", "l", "eng", "Subtitle language code")
	cmd.Flags().StringVarP(&output, "output", "o", "", "Output file path")
	return cmd
}
