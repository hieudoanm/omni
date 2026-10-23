package answer

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "answer",
		Short:   "Answer an inline query",
		Long:    `Send answers to an inline query.`,
		Example: `  telegram inline answer --inline-query-id "12345" --results '[{"type":"article","id":"1","title":"Result","input_message_content":{"message_text":"Hello"}}]'`,
		RunE:    runE,
	}

	cmd.Flags().String("inline-query-id", "", "Inline query ID")
	cmd.Flags().String("results", "", "JSON array of result objects")
	cmd.Flags().Int("cache-time", 300, "Cache time in seconds")
	cmd.Flags().Bool("is-personal", false, "Results are personal to the user")
	cmd.Flags().String("next-offset", "", "Offset for pagination")
	cmd.Flags().String("button", "", "JSON object with button data")

	return cmd
}
