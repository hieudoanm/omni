package size

import (
	"github.com/spf13/cobra"
)

func NewCommand() *cobra.Command {
	var path string
	cmd := &cobra.Command{
		Use:   "size [--path <file-or-dir>]",
		Short: "Show file or directory size",
		Long:  `Display the size of a file or the total size of a directory (recursive).`,
		Example: `  file size --path main.go
  file size -p /path/to/directory
  file size -p . --json`,
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")
			return runSize(path, jsonOutput)
		},
	}
	cmd.Flags().StringVarP(&path, "path", "p", "", "File or directory path")
	return cmd
}
