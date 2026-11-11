package text

import (
	"fmt"
	"regexp"

	"github.com/spf13/cobra"
)

func NewCommand() *cobra.Command {
	var pattern string
	var path string
	var ignoreCase bool
	var maxCount int
	var include string
	var maxDepth int

	cmd := &cobra.Command{
		Use:   "text [--pattern <pattern>] [--path <path>]",
		Short: "Search file contents using regex",
		Long:  `Search for a regex pattern inside files. If a directory is given, searches recursively.`,
		Example: `  search text --pattern "TODO" --path .
  search text --pattern "func.*error" --include "*.go"
  search text --pattern "import" --path src/ --ignore-case
  search text --pattern "panic" --max-count 5`,
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")

			rePattern := pattern
			if ignoreCase {
				rePattern = "(?i)" + pattern
			}

			re, err := regexp.Compile(rePattern)
			if err != nil {
				return fmt.Errorf("invalid regex %q: %w", pattern, err)
			}

			includePattern := includeToRegex(include)
			results, err := searchTextInRoots(pattern, []string{path}, re, includePattern, maxDepth, maxCount)
			if err != nil {
				return err
			}

			return outputTextResults(results, pattern, jsonOutput)
		},
	}

	cmd.Flags().StringVarP(&pattern, "pattern", "p", "", "Regex pattern to search")
	cmd.Flags().StringVarP(&path, "path", "P", ".", "File or directory to search")
	cmd.Flags().BoolVarP(&ignoreCase, "ignore-case", "i", false, "Case-insensitive search")
	cmd.Flags().IntVarP(&maxCount, "max-count", "m", 0, "Maximum number of matches")
	cmd.Flags().StringVar(&include, "include", "", "Glob pattern for file names (e.g. \"*.go\")")
	cmd.Flags().IntVarP(&maxDepth, "max-depth", "d", 0, "Maximum directory depth (0 = unlimited)")
	return cmd
}
