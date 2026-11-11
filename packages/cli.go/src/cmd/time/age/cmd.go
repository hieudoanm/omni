package age

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "age [--date <birthdate>]",
		Short: "Calculate age from a birthdate",
		Long: `Calculate age in years, months, and days from a given birthdate.
Supports multiple date formats including YYYY-MM-DD and RFC3339.`,
		Example: `  time age --date 1990-01-15
  time age --date 1990-01-15 --json`,
		RunE: func(cmd *cobra.Command, args []string) error {
			dateStr, _ := cmd.Flags().GetString("date")
			jsonOutput, _ := cmd.Flags().GetBool("json")
			return runAge(dateStr, jsonOutput)
		},
	}
	cmd.Flags().String("date", "", "Birthdate (e.g., 1990-01-15)")
	cmd.MarkFlagRequired("date")
	cmd.Flags().Bool("json", false, "Output in JSON format")
	return cmd
}
