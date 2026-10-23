package stats

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var values []string
	cmd := &cobra.Command{
		Use:   "stats [--values <n1,n2,...>]",
		Short: "Statistical summary of numbers",
		Long:  `Compute count, min, max, sum, mean, median, and standard deviation.`,
		Example: `  calc stats --values 1,2,3,4,5
  calc stats --values 100,200,300
  calc stats --json --values 1,2,3,4,5,6,7,8,9,10`,
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")
			return runStats(values, jsonOutput)
		},
	}

	cmd.Flags().StringSliceVarP(&values, "values", "v", nil, "Comma-separated numbers")
	cmd.Flags().Bool("json", false, "Output in JSON format")
	return cmd
}
