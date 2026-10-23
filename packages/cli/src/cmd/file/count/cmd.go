package count

import (
	"github.com/spf13/cobra"
)

func NewCommand() *cobra.Command {
	var filePath string
	cmd := &cobra.Command{
		Use:   "count [--file <path>]",
		Short: "Count lines, words, and bytes in a file",
		Long:  `Count lines, words, and bytes in a file (like Unix wc).`,
		Example: `  file count --file main.go
  file count -f main.go --json`,
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")
			return runCount(filePath, jsonOutput)
		},
	}
	cmd.Flags().StringVarP(&filePath, "file", "f", "", "File path")
	return cmd
}
