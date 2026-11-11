package path

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var filter string
	var sortOutput bool
	var jsonOutput bool

	cmd := &cobra.Command{
		Use:   "path [command]",
		Short: "List or search PATH directories and commands",
		Long: `Show all directories in PATH, or find which path a command resolves to.

With no arguments, lists all PATH entries.
With a command name, shows which executable would be found first.`,
		Example: `  system path
  system path go
  system path --sort
  system path --json`,
		Args: cobra.MaximumNArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			return pathRun(args, filter, sortOutput, jsonOutput)
		},
	}

	cmd.Flags().BoolVar(&sortOutput, "sort", false, "Sort alphabetically by path")
	cmd.Flags().BoolVarP(&jsonOutput, "json", "j", false, "Output in JSON format")

	return cmd
}
