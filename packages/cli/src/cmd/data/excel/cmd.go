package excel

import (
	"github.com/spf13/cobra"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/data/excel/info"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/data/excel/tocsv"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/data/excel/tojson"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "excel",
		Short: "Excel spreadsheet operations",
		Long:  `Convert Excel files to CSV/JSON, or show sheet info.`,
		Example: `  data excel to-csv spreadsheet.xlsx
  data excel to-json spreadsheet.xlsx
  data excel info spreadsheet.xlsx`,
		RunE: func(cmd *cobra.Command, args []string) error { return cmd.Help() },
	}
	cmd.AddCommand(
		tocsv.NewCmd(),
		tojson.NewCmd(),
		info.NewCmd(),
	)
	return cmd
}
