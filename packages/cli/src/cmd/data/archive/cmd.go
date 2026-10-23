package archive

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var action string
	var output string

	cmd := &cobra.Command{
		Use:   "archive [files...]",
		Short: "Create or extract zip archives",
		Long:  `Create zip archives from files or extract existing zip archives.`,
		Example: `  data archive file1.txt file2.txt -o out.zip
  data archive archive.zip --action extract --output ./out`,
		RunE: func(cmd *cobra.Command, args []string) error {
			return runE(args, action, output)
		},
	}

	cmd.Flags().StringVar(&action, "action", "create", "Action to perform (create or extract)")
	cmd.Flags().StringVarP(&output, "output", "o", "", "Output file (create) or directory (extract)")

	return cmd
}
