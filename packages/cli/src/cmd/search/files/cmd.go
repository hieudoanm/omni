package files

import (
	"github.com/spf13/cobra"
)

func NewCommand() *cobra.Command {
	var pattern string
	var dir string
	var maxDepth int
	var fileType string
	var hidden bool

	cmd := &cobra.Command{
		Use:   "files [--pattern <pattern>] [--dir <dir>]",
		Short: "Find files by glob pattern",
		Long: `Find files matching a glob pattern starting from an optional root directory.

Patterns use glob syntax:
  *.go          - all Go files
  **/*.ts       - TypeScript files in any subdirectory
  src/**/*.ts   - TypeScript files under src/
  test_*.py     - files matching test_ prefix with .py extension`,
		Example: `  search files --pattern "*.go"
  search files --pattern "*.ts" --dir src/
  search files --pattern "**/*.md" --dir docs/
  search files --pattern "*.py" --type f
  search files --pattern "config.*" --hidden`,
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")
			results, err := findFilesWithGlob(pattern, dir, maxDepth, fileType, hidden)
			if err != nil {
				return err
			}

			return outputFileResults(results, pattern, dir, jsonOutput)
		},
	}

	cmd.Flags().StringVarP(&pattern, "pattern", "p", "", "Glob pattern to match")
	cmd.Flags().StringVarP(&dir, "dir", "d", ".", "Root directory to search")
	cmd.Flags().IntVarP(&maxDepth, "max-depth", "D", 0, "Maximum directory depth (0 = unlimited)")
	cmd.Flags().StringVarP(&fileType, "type", "t", "", "Filter by type: f (file) or d (directory)")
	cmd.Flags().BoolVarP(&hidden, "hidden", "H", false, "Include hidden files and directories")
	return cmd
}
