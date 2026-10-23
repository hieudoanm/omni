package which

import (
	"github.com/spf13/cobra"
)

func NewCommand() *cobra.Command {
	var all bool

	cmd := &cobra.Command{
		Use:   "which [commands...]",
		Short: "Locate executable commands in PATH",
		Long: `Find executables by searching each directory in PATH.

Shows all matches with --all, not just the first.`,
		Example: `  better which go
  better which python node
  better which --all go
  better which --json go python`,
		Args: cobra.MinimumNArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")
			return run(args, all, jsonOutput)
		},
	}

	cmd.Flags().BoolVarP(&all, "all", "a", false, "Show all matches in PATH, not just the first")
	return cmd
}
