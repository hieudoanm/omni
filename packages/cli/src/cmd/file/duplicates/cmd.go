package duplicates

import (
	"github.com/spf13/cobra"
)

func NewCommand() *cobra.Command {
	var minSize int64
	var dir string
	cmd := &cobra.Command{
		Use:   "duplicates [--dir <path>]",
		Short: "Find duplicate files by size and partial hash",
		Long:  `Scan a directory for duplicate files by comparing SHA-256 hashes of files with the same size.`,
		Example: `  file duplicates --dir .
  file duplicates -d /path/to/files --min-size 1024
  file duplicates -d . --json`,
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")
			return runDuplicates(dir, minSize, jsonOutput)
		},
	}
	cmd.Flags().StringVarP(&dir, "dir", "d", "", "Directory to scan")
	cmd.Flags().Int64VarP(&minSize, "min-size", "m", 1, "Minimum file size to consider (bytes)")
	return cmd
}
