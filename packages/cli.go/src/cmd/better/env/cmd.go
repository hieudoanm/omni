package env

import (
	"github.com/spf13/cobra"
)

func NewCommand() *cobra.Command {
	var name string
	var sortBy string

	cmd := &cobra.Command{
		Use:   "env",
		Short: "Show environment variables in a clean table",
		Long: `Display environment variables as an aligned table with optional filtering.

Columns: KEY, VALUE`,
		Example: `  better env
  better env --name PATH
  better env --name HOME
  better env --sort key
  better env --json`,
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")
			return run(name, sortBy, jsonOutput)
		},
	}

	cmd.Flags().StringVarP(&name, "name", "n", "", "Filter by variable name (substring match)")
	cmd.Flags().StringVarP(&sortBy, "sort", "s", "key", "Sort: key, value")
	return cmd
}
