package models

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var (
		modelsSearch string
		modelsJSON   bool
	)

	cmd := &cobra.Command{
		Use:   "models",
		Short: "List available free models from OpenRouter",
		Long:  `Fetch and display all free models available on OpenRouter. Models can be filtered by name or ID with --search, and grouped by provider for easy browsing.`,
		Example: `  openrouter models
  openrouter models --search gemma
  openrouter models --json`,
		RunE: func(cmd *cobra.Command, args []string) error {
			return runModels(modelsSearch, modelsJSON)
		},
	}

	cmd.Flags().StringVarP(&modelsSearch, "search", "s", "", "Filter models by name or ID")
	cmd.Flags().BoolVar(&modelsJSON, "json", false, "Output raw JSON")
	return cmd
}
