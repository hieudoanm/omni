package json

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var query, diff, merge string

	cmd := &cobra.Command{
		Use:   "json [file]",
		Short: "Query, format, diff, and merge JSON data",
		Long:  `Pretty-print JSON, run jq-like queries, or diff/merge two JSON files.`,
		Example: `  data json data.json
  data json data.json --query ".name"
  data json data.json --diff file2.json
  data json --merge base.json patch.json`,
		Args: cobra.MaximumNArgs(2),
		RunE: func(cmd *cobra.Command, args []string) error {
			return runE(args, query, diff, merge)
		},
	}

	cmd.Flags().StringVarP(&query, "query", "q", "", "JQ-like query (e.g. .name, .items[0])")
	cmd.Flags().StringVar(&diff, "diff", "", "Diff with another JSON file")
	cmd.Flags().StringVar(&merge, "merge", "", "Merge with another JSON file (patch)")
	return cmd
}
