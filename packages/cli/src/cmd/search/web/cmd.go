package web

import (
	"fmt"

	"github.com/spf13/cobra"
)

func NewCommand() *cobra.Command {
	var query string
	var maxResults int
	var source string

	cmd := &cobra.Command{
		Use:   "web [--query <query>]",
		Short: "Search the internet",
		Long:  `Search the web for a query. Uses DuckDuckGo by default (no API key needed).`,
		Example: `  search web --query "golang concurrency patterns"
  search web --query "latest AI news 2026" --max-results 10
  search web --query "site:github.com golang cli" --source google`,
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")
			if source == "" || source == "duckduckgo" {
				return duckDuckGoSearch(query, maxResults, jsonOutput)
			}

			return fmt.Errorf("unsupported search source: %s (use 'duckduckgo')", source)
		},
	}

	cmd.Flags().StringVarP(&query, "query", "q", "", "Search query")
	cmd.Flags().IntVarP(&maxResults, "max-results", "n", 5, "Maximum number of results")
	cmd.Flags().StringVarP(&source, "source", "s", "duckduckgo", "Search source (duckduckgo)")
	return cmd
}
