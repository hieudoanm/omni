package tocsv

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "to-csv <file>",
		Short: "Convert Excel to CSV",
		Long:  `Read an XLSX file and write each sheet as a CSV file.`,
		Example: `  data excel to-csv spreadsheet.xlsx
  data excel to-csv spreadsheet.xlsx -o ./out`,
		Args: cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			output, _ := cmd.Flags().GetString("output")
			return runE(args[0], output)
		},
	}

	cmd.Flags().StringP("output", "o", "", "Output directory")

	return cmd
}
