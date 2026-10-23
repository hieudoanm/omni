package split

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var format string
	var rows int
	var output string

	cmd := &cobra.Command{
		Use:   "split <file>",
		Short: "Split a CSV file into smaller chunks",
		Long:  `Read a CSV file and split it into multiple files of N rows each.`,
		Example: `  data split data.csv
  data split data.csv --rows 500
  data split data.csv --format excel --output ./chunks`,
		Args: cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			return runE(args[0], format, rows, output)
		},
	}

	cmd.Flags().StringVar(&format, "format", "csv", "Input format (csv or excel)")
	cmd.Flags().IntVar(&rows, "rows", 1000, "Rows per chunk")
	cmd.Flags().StringVarP(&output, "output", "o", "", "Output directory")

	return cmd
}
