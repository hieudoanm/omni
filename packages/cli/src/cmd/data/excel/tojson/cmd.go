package tojson

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "to-json <file>",
		Short: "Convert Excel to JSON",
		Long:  `Read an XLSX file and output each sheet as JSON.`,
		Example: `  data excel to-json spreadsheet.xlsx
  data excel to-json spreadsheet.xlsx --pretty`,
		Args: cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			pretty, _ := cmd.Flags().GetBool("pretty")
			return runE(args[0], pretty)
		},
	}

	cmd.Flags().Bool("pretty", false, "Pretty-print JSON output")

	return cmd
}
