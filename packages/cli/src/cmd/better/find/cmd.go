package find

import (
	"github.com/spf13/cobra"
)

func NewCommand() *cobra.Command {
	var dir string
	var pattern string
	var name string
	var fileType string
	var maxDepth int
	var all bool
	var long bool
	var human bool

	cmd := &cobra.Command{
		Use:   "find [--pattern <glob>] [--dir <dir>] [--name <substring>] [--long]",
		Short: "Recursively find files and directories",
		Long: `Recursively search for files and directories with optional filtering.

Results are shown in a markdown table with full paths.
Combine --long with --human for detailed listings with readable sizes.`,
		Example: `  better find
  better find --name "*.go"
  better find --pattern "*.ts" --dir src/
  better find --name config --type f
  better find --long --human
  better find --max-depth 2
  better find --all --json`,
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")
			return run(cmd, dir, pattern, name, fileType, maxDepth, all, long, human, jsonOutput)
		},
	}

	cmd.Flags().StringVarP(&dir, "dir", "d", ".", "Root directory to search")
	cmd.Flags().StringVarP(&pattern, "pattern", "p", "", "Glob pattern to match (e.g. *.go)")
	cmd.Flags().StringVarP(&name, "name", "n", "", "Filter by name substring")
	cmd.Flags().StringVarP(&fileType, "type", "t", "", "Filter by type: f (file) or d (directory)")
	cmd.Flags().IntVarP(&maxDepth, "max-depth", "D", 0, "Maximum recursion depth (0 = unlimited)")
	cmd.Flags().BoolVarP(&all, "all", "a", false, "Include hidden files and directories")
	cmd.Flags().BoolVarP(&long, "long", "l", false, "Long format with details")
	cmd.Flags().BoolVarP(&human, "human", "H", false, "Human-readable sizes (requires --long)")
	return cmd
}
