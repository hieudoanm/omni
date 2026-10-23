package decrypt

import "github.com/spf13/cobra"

func NewCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "decrypt <file>",
		Short: "Remove password protection from a PDF",
		Long:  "Decrypt a PDF file by removing its password protection.",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			return run(cmd, args[0])
		},
	}
	cmd.Flags().StringP("password", "p", "", "Current password of the PDF")
	cmd.Flags().StringP("output", "o", "", "Output file path (default: overwrite input)")
	return cmd
}
