package ls

import (
	"github.com/spf13/cobra"
)

func NewCommand() *cobra.Command {
	var dir string
	var all bool
	var long bool
	var human bool
	var reverse bool
	var sortByTime bool
	var sortBySize bool

	cmd := &cobra.Command{
		Use:   "ls [--dir <dir>] [--long] [--all] [--human] [--reverse] [--time] [--size]",
		Short: "List directory contents",
		Long: `List files and directories with optional details in table format.

By default shows names in sorted columns. Combine flags for detailed views:
  --long  - permissions, size, modified time, name
  --all   - include hidden files (.dotfiles)
  --human - human-readable sizes (KB, MB, GB)
  --time  - sort by modification time (newest first)
  --size  - sort by file size (largest first)
  --reverse - reverse sort order`,
		Example: `  better ls
  better ls --long
  better ls -la
  better ls -lah
  better ls --dir /tmp
  better ls --dir /tmp --json
  better ls -lt
  better ls -lS`,
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")
			return run(cmd, dir, all, long, human, reverse, sortByTime, sortBySize, jsonOutput)
		},
	}

	cmd.Flags().StringVar(&dir, "dir", ".", "Directory to list")
	cmd.Flags().BoolVarP(&all, "all", "a", false, "Include hidden files")
	cmd.Flags().BoolVarP(&long, "long", "l", false, "Long format with details")
	cmd.Flags().BoolVarP(&human, "human", "H", false, "Human-readable sizes")
	cmd.Flags().BoolVarP(&reverse, "reverse", "r", false, "Reverse sort order")
	cmd.Flags().BoolVarP(&sortByTime, "time", "t", false, "Sort by modification time")
	cmd.Flags().BoolVarP(&sortBySize, "size", "S", false, "Sort by file size")
	return cmd
}
