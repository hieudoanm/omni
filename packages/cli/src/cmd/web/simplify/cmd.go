package simplify

import (
	"github.com/spf13/cobra"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/web/simplify/csv"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/web/simplify/images"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/web/simplify/md"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "simplify",
		Short: "Extract and convert web content",
		Long:  `Extract tables to CSV or webpage content to Markdown.`,
		Example: `  web simplify csv --url https://en.wikipedia.org/wiki/List_of_countries_by_population
  web simplify md --url https://en.wikipedia.org/wiki/Go_(programming_language)`,
		RunE: func(cmd *cobra.Command, args []string) error { return cmd.Help() },
	}
	cmd.AddCommand(csv.NewCmd())
	cmd.AddCommand(md.NewCmd())
	cmd.AddCommand(images.NewCmd())
	return cmd
}
