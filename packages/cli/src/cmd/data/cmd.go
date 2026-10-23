package data

import (
	"github.com/hieudoanm/omni/packages/cli/src/cmd/data/archive"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/data/csv"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/data/ebook"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/data/excel"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/data/json"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/data/split"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/data/yml"
	"github.com/spf13/cobra"
)

func NewCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "data",
		Short: "Data serialization and transformation tools",
		Long:  `Format, convert, split, archive, and process data files.`,
		Example: `  data csv data.csv
  data yml config.yml --validate
  data json data.json --query ".name"
  data split data.csv --rows 500
  data archive file.txt -o out.zip
  data excel info sheet.xlsx
  data ebook book.epub --format mobi`,
		RunE: func(cmd *cobra.Command, args []string) error { return cmd.Help() },
	}
	cmd.AddCommand(
		archive.NewCmd(),
		csv.NewCmd(),
		ebook.NewCmd(),
		excel.NewCmd(),
		json.NewCmd(),
		split.NewCmd(),
		yml.NewCmd(),
	)
	cmd.PersistentFlags().BoolP("json", "j", false, "Output in JSON format")
	return cmd
}
