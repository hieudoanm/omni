package date

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var addDays int
	var addMonths int
	var addYears int
	var diff string
	var format string

	cmd := &cobra.Command{
		Use:   "date",
		Short: "Date arithmetic and difference",
		Long:  `Add/subtract days, months, or years from a date, or calculate difference between two dates.`,
		Example: `  calc date --add 90
  calc date --add 30 "2026-01-01"
  calc date --diff "2026-06-01" "2026-01-01"`,
		Args: cobra.MaximumNArgs(2),
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")
			return runDate(args, addDays, addMonths, addYears, diff, format, jsonOutput)
		},
	}

	cmd.Flags().IntVar(&addDays, "add", 0, "Add N days")
	cmd.Flags().IntVar(&addMonths, "add-months", 0, "Add N months")
	cmd.Flags().IntVar(&addYears, "add-years", 0, "Add N years")
	cmd.Flags().StringVar(&diff, "diff", "", "Calculate days between two dates (YYYY-MM-DD)")
	cmd.Flags().StringVar(&format, "format", "", "Output format (uses Go time layout)")
	cmd.Flags().Bool("json", false, "Output in JSON format")

	return cmd
}
