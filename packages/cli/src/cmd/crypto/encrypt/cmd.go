package encrypt

import "github.com/spf13/cobra"

func NewCommand() *cobra.Command {
	var file, password, output string

	cmd := &cobra.Command{
		Use:   "encrypt [--file <file>]",
		Short: "Encrypt a file with AES-256-GCM",
		Long:  `Encrypt a file using AES-256-GCM with a key derived from the given password.`,
		Example: `  crypto encrypt --file secret.txt --password "hunter2"
  crypto encrypt --file secret.txt --password "hunter2" --output secret.enc`,
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")
			return runEncrypt(file, password, output, jsonOutput)
		},
	}

	cmd.Flags().StringVarP(&file, "file", "f", "", "File to encrypt")
	cmd.Flags().StringVarP(&password, "password", "p", "", "Encryption password")
	cmd.Flags().StringVarP(&output, "output", "o", "", "Output file (default: <file>.enc)")
	cmd.MarkFlagRequired("password")
	return cmd
}
