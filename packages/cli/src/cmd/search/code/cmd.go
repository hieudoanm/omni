package code

import (
	"github.com/spf13/cobra"
)

func NewCommand() *cobra.Command {
	var symbol string
	var dir string
	var lang string
	var kind string
	var maxResults int

	cmd := &cobra.Command{
		Use:   "code [--symbol <symbol>] [--dir <dir>]",
		Short: "Search for code symbols (functions, types, variables)",
		Long: `Find code symbol definitions matching a name pattern.

Supports Go, TypeScript/JavaScript, Python, and Rust.`,
		Example: `  search code --symbol "ParseCard"
  search code --symbol "handle" --dir src/
  search code --symbol "NewCommand" --lang go
  search code --symbol "getUser" --kind function
  search code --symbol "fetchAPI" --lang ts`,
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")
			results, err := searchCodeSymbols(symbol, dir, lang, kind, maxResults)
			if err != nil {
				return err
			}

			return outputCodeResults(results, symbol, jsonOutput)
		},
	}

	cmd.Flags().StringVarP(&symbol, "symbol", "s", "", "Symbol name to search")
	cmd.Flags().StringVarP(&dir, "dir", "d", ".", "Root directory to search")
	cmd.Flags().StringVarP(&lang, "lang", "l", "", "Language filter (go, ts, py, rs)")
	cmd.Flags().StringVarP(&kind, "kind", "k", "", "Symbol kind (function, type, variable, method, class)")
	cmd.Flags().IntVarP(&maxResults, "max-results", "n", 0, "Maximum number of results (0 = unlimited)")
	return cmd
}
