package status

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var (
		statusSearch  string
		statusWorkers int
	)

	cmd := &cobra.Command{
		Use:   "status",
		Short: "Probe free models for availability and latency",
		Long:  `Probe free OpenRouter models in parallel to check which are currently available, rate-limited, restricted, or erroring. Reports latency for available models and sorts results by status.`,
		Example: `  openrouter status
  openrouter status --search gemma
  openrouter status --workers 10`,
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")
			return runStatus(statusSearch, statusWorkers, jsonOutput)
		},
	}

	cmd.Flags().StringVarP(&statusSearch, "search", "s", "", "Filter models by name or ID before probing")
	cmd.Flags().IntVarP(&statusWorkers, "workers", "w", 6, "Parallel probe workers")
	return cmd
}
