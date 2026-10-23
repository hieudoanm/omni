package stats

import (
	"github.com/spf13/cobra"
)

func NewCommand() *cobra.Command {
	var dir string
	cmd := &cobra.Command{
		Use:   "stats [--dir <path>]",
		Short: "Show file statistics by extension",
		Long:  `Walk a directory and produce statistics about files grouped by extension. Shows file count and total size per extension.`,
		Example: `  file stats --dir .
  file stats -d /path/to/project
  file stats -d . --json`,
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")
			return runStats(dir, jsonOutput)
		},
	}
	cmd.Flags().StringVarP(&dir, "dir", "d", "", "Directory path")
	return cmd
}
