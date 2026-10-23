package head

import (
	"github.com/spf13/cobra"
)

func NewCommand() *cobra.Command {
	var lines int
	var filePath string
	cmd := &cobra.Command{
		Use:   "head [--file <path>]",
		Short: "Show the first N lines of a file",
		Long:  `Display the first N lines of a file (like Unix head).`,
		Example: `  file head --file main.go
  file head -f main.go --lines 20`,
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")
			return runHead(filePath, lines, jsonOutput)
		},
	}
	cmd.Flags().StringVarP(&filePath, "file", "f", "", "File path")
	cmd.Flags().IntVarP(&lines, "lines", "n", 10, "Number of lines")
	return cmd
}
