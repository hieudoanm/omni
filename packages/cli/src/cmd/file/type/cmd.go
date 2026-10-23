package ftype

import (
	"github.com/spf13/cobra"
)

func NewCommand() *cobra.Command {
	var filePath string
	cmd := &cobra.Command{
		Use:   "type [--file <path>]",
		Short: "Detect file type by extension",
		Long:  `Detect a file's MIME type based on its extension and display file metadata (size, mode, modification time).`,
		Example: `  file type --file image.png
  file type -f document.pdf`,
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")
			return runType(filePath, jsonOutput)
		},
	}
	cmd.Flags().StringVarP(&filePath, "file", "f", "", "File path")
	return cmd
}
