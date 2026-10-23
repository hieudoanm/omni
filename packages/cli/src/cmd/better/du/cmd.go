package du

import (
	"github.com/spf13/cobra"
)

func NewCommand() *cobra.Command {
	var dir string
	var depth int
	var sortBy string
	var all bool
	var human bool
	var threshold int64

	cmd := &cobra.Command{
		Use:   "du",
		Short: "Show disk usage by directory",
		Long: `Calculate and display disk usage for directories, sorted by size.

Columns: SIZE, PATH
With --long: ITEMS, SIZE, PATH.`,
		Example: `  better du
  better du --dir src/
  better du --depth 1
  better du --sort name
  better du --human
  better du --threshold 1024
  better du --json`,
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")
			return run(dir, depth, sortBy, all, human, threshold, jsonOutput)
		},
	}

	cmd.Flags().StringVarP(&dir, "dir", "d", ".", "Root directory to analyse")
	cmd.Flags().IntVarP(&depth, "depth", "D", 1, "Max directory depth (0 = unlimited)")
	cmd.Flags().StringVarP(&sortBy, "sort", "s", "size", "Sort column: size, name")
	cmd.Flags().BoolVarP(&all, "all", "a", false, "Show files too, not just directories")
	cmd.Flags().BoolVarP(&human, "human", "H", false, "Human-readable sizes")
	cmd.Flags().Int64VarP(&threshold, "threshold", "t", 0, "Minimum size in KB to show (0 = no filter)")
	return cmd
}
