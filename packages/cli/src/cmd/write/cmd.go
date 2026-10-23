package write

import (
	"github.com/spf13/cobra"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/write/grammar"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/write/rewrite"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/write/summarize"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/write/translate"
)

func NewCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "write",
		Short: "AI-powered text tools using OpenRouter",
		Long:  `Summarize, fix grammar, rewrite, and translate text using AI via OpenRouter.`,
		Example: `  write summarize "long article here..."
  write grammar --file draft.txt
  write rewrite "original text" --style formal
  write translate "Hello" --target vietnamese`,
		RunE: func(cmd *cobra.Command, args []string) error { return cmd.Help() },
	}
	cmd.AddCommand(
		summarize.NewCmd(),
		grammar.NewCmd(),
		rewrite.NewCmd(),
		translate.NewCmd(),
	)
	return cmd
}
