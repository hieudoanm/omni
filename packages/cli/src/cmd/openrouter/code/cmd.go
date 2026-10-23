package code

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var codeModelFlag string

	cmd := &cobra.Command{
		Use:   "code",
		Short: "AI coding assistant with file editing and bash access",
		Long: `An interactive TUI coding assistant powered by OpenRouter.

Supports reading, writing, and editing files, as well as running bash commands.
All tool calls require your approval before execution.`,
		Example: `  openrouter code
  openrouter code --model google/gemma-4-26b-a4b-it:free`,
		RunE: func(cmd *cobra.Command, args []string) error {
			return runCode(codeModelFlag)
		},
	}

	cmd.Flags().StringVar(&codeModelFlag, "model", "", "Model ID (default: auto-select tool-capable model)")
	return cmd
}
