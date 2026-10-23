package search

import (
	"github.com/hieudoanm/omni/packages/cli/src/cmd/search/code"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/search/files"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/search/text"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/search/web"
	"github.com/spf13/cobra"
)

func NewCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "search",
		Short: "Universal search for files, text, code, and the web",
		Long: `Search for files by name, text inside files, code symbols, and web content.

Search is the universal entry point for finding things:
  search files  - find files by glob pattern
  search text   - search file contents by regex
  search code   - find code symbols (functions, types, etc.)
  search web    - search the internet`,
		Example: `  search files --pattern "*.go"
  search text --pattern "TODO" --path .
  search code --symbol "NewCommand"
  search web --query "golang concurrency patterns"`,
		RunE: func(cmd *cobra.Command, args []string) error { return cmd.Help() },
	}
	cmd.AddCommand(files.NewCommand())
	cmd.AddCommand(text.NewCommand())
	cmd.AddCommand(code.NewCommand())
	cmd.AddCommand(web.NewCommand())
	cmd.PersistentFlags().BoolP("json", "j", false, "Output in JSON format")
	return cmd
}
