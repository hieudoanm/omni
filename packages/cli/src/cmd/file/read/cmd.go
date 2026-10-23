package read

import (
	"os"

	"github.com/spf13/cobra"
)

func NewCommand() *cobra.Command {
	var lines int
	var offset int
	var showLineNumbers bool
	var path string

	cmd := &cobra.Command{
		Use:   "read [--file <path>]",
		Short: "Read file content with line numbers",
		Long:  `Read a file and display its content with optional line numbers, offset, and line limit.`,
		Example: `  file read --file main.go
  file read -f main.go --lines 50
  file read -f main.go --offset 10 --lines 20
  file read -f main.go --no-numbers`,
		RunE: func(cmd *cobra.Command, args []string) error {
			content, displayLines, totalLines, err := readFileContent(path, offset, lines)
			if err != nil {
				return err
			}

			if ok, _ := cmd.Flags().GetBool("json"); ok {
				info, err := os.Stat(path)
				if err != nil {
					return err
				}
				return renderReadJSON(path, info, content, displayLines, totalLines, offset, lines)
			}

			renderReadText(path, displayLines, offset, totalLines, showLineNumbers)
			return nil
		},
	}

	cmd.Flags().StringVarP(&path, "file", "f", "", "File path")
	cmd.Flags().IntVarP(&lines, "lines", "n", 0, "Number of lines to show (0 = all)")
	cmd.Flags().IntVarP(&offset, "offset", "o", 0, "Starting line offset (0-based)")
	cmd.Flags().BoolVar(&showLineNumbers, "numbers", true, "Show line numbers")
	return cmd
}
