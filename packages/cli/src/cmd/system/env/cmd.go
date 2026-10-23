package env

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var filter string
	var sortOutput bool
	var jsonOutput bool

	cmd := &cobra.Command{
		Use:   "env [key]",
		Short: "List or search environment variables",
		Long:  `Display all environment variables, or filter by key prefix.`,
		Example: `  system env
  system env PATH
  system env HOME
  system env --sort
  system env --json`,
		Args: cobra.MaximumNArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			if len(args) > 0 {
				filter = args[0]
			}
			return envRun(filter, sortOutput, jsonOutput)
		},
	}

	cmd.Flags().BoolVar(&sortOutput, "sort", false, "Sort alphabetically by key")
	cmd.Flags().BoolVarP(&jsonOutput, "json", "j", false, "Output in JSON format")
	return cmd
}
