package info

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "info <file>",
		Short:   "Show Excel file information",
		Long:    `Display sheet names and row counts from an XLSX file.`,
		Example: `  data excel info spreadsheet.xlsx`,
		Args:    cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			return runE(args[0])
		},
	}

	return cmd
}
