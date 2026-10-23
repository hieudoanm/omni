package decrypt

import "github.com/spf13/cobra"

func NewCommand() *cobra.Command {
	var file, password, output string

	cmd := &cobra.Command{
		Use:   "decrypt [--file <file>]",
		Short: "Decrypt a file encrypted with AES-256-GCM",
		Long:  `Decrypt a file previously encrypted with "crypto encrypt" using the same password.`,
		Example: `  crypto decrypt --file secret.enc --password "hunter2"
  crypto decrypt --file secret.enc --password "hunter2" --output secret.txt`,
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")
			return runDecrypt(file, password, output, jsonOutput)
		},
	}

	cmd.Flags().StringVarP(&file, "file", "f", "", "File to decrypt")
	cmd.Flags().StringVarP(&password, "password", "p", "", "Decryption password")
	cmd.Flags().StringVarP(&output, "output", "o", "", "Output file")
	cmd.MarkFlagRequired("password")
	return cmd
}
