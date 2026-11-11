package tail

import (
	"github.com/spf13/cobra"
)

func NewCommand() *cobra.Command {
	var lines int
	var filePath string
	cmd := &cobra.Command{
		Use:   "tail [--file <path>]",
		Short: "Show the last N lines of a file",
		Long:  `Display the last N lines of a file (like Unix tail). Uses a ring buffer to efficiently stream through the file.`,
		Example: `  file tail --file main.go
  file tail -f main.go --lines 20`,
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")
			return runTail(filePath, lines, jsonOutput)
		},
	}
	cmd.Flags().StringVarP(&filePath, "file", "f", "", "File path")
	cmd.Flags().IntVarP(&lines, "lines", "n", 10, "Number of lines")
	return cmd
}
