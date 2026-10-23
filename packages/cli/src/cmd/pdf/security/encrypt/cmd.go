package encrypt

import "github.com/spf13/cobra"

func NewCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "encrypt <file>",
		Short: "Encrypt or decrypt a PDF",
		Long:  "Add or remove password protection from a PDF file.",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			return run(cmd, args[0])
		},
	}
	cmd.Flags().StringP("password", "p", "", "Password for encryption/decryption")
	cmd.Flags().Bool("decrypt", false, "Decrypt instead of encrypt")
	cmd.Flags().StringP("output", "o", "", "Output file path (default: overwrite input)")
	return cmd
}
