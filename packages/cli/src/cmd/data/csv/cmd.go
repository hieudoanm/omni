package csv

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var jsonOut bool

	cmd := &cobra.Command{
		Use:   "csv <file>",
		Short: "View and format CSV files",
		Long:  `Read a CSV file (or stdin) and display records as pipe-delimited text or JSON.`,
		Example: `  data csv data.csv
  data csv data.csv --json
  cat data.csv | data csv`,
		Args: cobra.MaximumNArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			return runE(args, jsonOut)
		},
	}

	cmd.Flags().BoolVar(&jsonOut, "json", false, "Output in JSON format")
	return cmd
}
