package recall

import (
	"github.com/spf13/cobra"
)

const maxDigits = 12

func NewCommand() *cobra.Command {
	return &cobra.Command{
		Use:   "recall",
		Short: "Test your short-term number memory",
		Long:  `A number is shown briefly. Memorize it, then type it back. The length increases as you get them right. Type 'quit' to stop.`,
		RunE: func(cmd *cobra.Command, args []string) error {
			return runRecall()
		},
	}
}
