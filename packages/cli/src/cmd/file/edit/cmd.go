package edit

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"
)

func NewCommand() *cobra.Command {
	var useRegex bool
	var preview bool
	var count int
	var path, oldStr, newStr string

	cmd := &cobra.Command{
		Use:   "edit [--file <path>] [--old <text>] [--new <text>]",
		Short: "Find and replace text in a file",
		Long:  `Replace occurrences of a string (or regex pattern) in a file.`,
		Example: `  file edit -f main.go --old "foo" --new "bar"
  file edit --regex -f main.go --old "foo.*" --new "bar"
  file edit -f main.go -o "foo" -n "bar" --preview
  file edit -f main.go -o "foo" -n "bar" --count 1`,
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")

			info, err := os.Stat(path)
			if err != nil {
				return err
			}
			if info.IsDir() {
				return fmt.Errorf("%q is a directory", path)
			}

			data, err := os.ReadFile(path)
			if err != nil {
				return err
			}

			replaced, matchCount, err := performEdit(string(data), oldStr, newStr, useRegex, count)
			if err != nil {
				return err
			}

			return outputEditResult(path, string(data), replaced, matchCount, preview, info.Mode(), jsonOutput)
		},
	}

	cmd.Flags().StringVarP(&path, "file", "f", "", "File path")
	cmd.Flags().StringVarP(&oldStr, "old", "o", "", "Text or pattern to replace")
	cmd.Flags().StringVar(&newStr, "new", "", "Replacement text")
	cmd.Flags().BoolVarP(&useRegex, "regex", "r", false, "Interpret old as a regex pattern")
	cmd.Flags().BoolVarP(&preview, "preview", "p", false, "Preview changes without modifying the file")
	cmd.Flags().IntVarP(&count, "count", "n", 0, "Number of occurrences to replace (0 = all)")
	return cmd
}
