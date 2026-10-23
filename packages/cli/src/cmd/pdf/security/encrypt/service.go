package encrypt

import (
	"fmt"

	"github.com/pdfcpu/pdfcpu/pkg/api"
	"github.com/spf13/cobra"
)

func run(cmd *cobra.Command, file string) error {
	password, _ := cmd.Flags().GetString("password")
	decrypt, _ := cmd.Flags().GetBool("decrypt")
	output, _ := cmd.Flags().GetString("output")

	if output == "" {
		output = file
	}

	conf := api.LoadConfiguration()

	if decrypt {
		if err := api.DecryptFile(file, output, conf); err != nil {
			return fmt.Errorf("decrypt failed: %w", err)
		}
		fmt.Fprintf(cmd.OutOrStdout(), "Decrypted %s\n", output)
	} else {
		conf.UserPW = password
		if err := api.EncryptFile(file, output, conf); err != nil {
			return fmt.Errorf("encrypt failed: %w", err)
		}
		fmt.Fprintf(cmd.OutOrStdout(), "Encrypted %s\n", output)
	}
	return nil
}
