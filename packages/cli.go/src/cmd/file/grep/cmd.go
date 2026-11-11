package grep

import (
	"github.com/spf13/cobra"
)

func NewCommand() *cobra.Command {
	var include, pattern, searchPath string
	var context int
	var fixed bool
	var maxCount int
	var ignoreCase bool

	cmd := &cobra.Command{
		Use:   "grep [--pattern <regex>] [--path <dir>]",
		Short: "Search file contents using regex or fixed strings",
		Long:  `Search for a pattern in files (grep = global regular expression print). Supports recursive directory search and glob patterns.`,
		Example: `  file grep --pattern "TODO" --path main.go
  file grep -p "func" --path . --ignore-case
  file grep --pattern "error" --include "*.go"
  file grep --fixed -p "fmt.Println" --path src/
  file grep -p "panic" --path . --context 2`,
		Args: cobra.ArbitraryArgs,
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")

			searchPaths := []string{searchPath}
			if searchPath == "" {
				searchPaths = args
			}
			if len(searchPaths) == 0 {
				searchPaths = []string{"."}
			}

			re, err := compileSearchPattern(pattern, fixed, ignoreCase)
			if err != nil {
				return err
			}

			includePattern := compileIncludePattern(include)
			matches, totalFiles := grepFiles(re, searchPaths, includePattern, context, maxCount)
			return outputGrepResults(matches, totalFiles, pattern, jsonOutput)
		},
	}

	cmd.Flags().StringVarP(&pattern, "pattern", "p", "", "Regex or fixed string pattern to search for")
	cmd.Flags().StringVarP(&searchPath, "path", "P", "", "File or directory to search (default: .)")
	cmd.Flags().StringVarP(&include, "include", "i", "", "Glob pattern for file names (e.g. \"*.go\")")
	cmd.Flags().IntVarP(&context, "context", "C", 0, "Show N lines of context around matches")
	cmd.Flags().BoolVarP(&fixed, "fixed", "F", false, "Fixed string match (not regex)")
	cmd.Flags().IntVarP(&maxCount, "max-count", "m", 0, "Maximum number of matches")
	cmd.Flags().BoolVarP(&ignoreCase, "ignore-case", "v", false, "Case-insensitive search")
	return cmd
}
