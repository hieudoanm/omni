package age

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var year, month, day int

	cmd := &cobra.Command{
		Use:     "age",
		Short:   "Calculate age from birth date",
		Long:    `Calculate age in years, months, and days from a given birth date.`,
		Example: `  calc age --year 1990 --month 1 --day 15`,
		Args:    cobra.NoArgs,
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")
			return runAge(year, month, day, jsonOutput)
		},
	}

	cmd.Flags().IntVarP(&year, "year", "y", 0, "Birth year")
	cmd.Flags().IntVarP(&month, "month", "m", 0, "Birth month (1-12)")
	cmd.Flags().IntVarP(&day, "day", "d", 0, "Birth day (1-31)")
	cmd.Flags().Bool("json", false, "Output in JSON format")
	return cmd
}
