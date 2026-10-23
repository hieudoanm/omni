package decrypt

import (
	"fmt"

	"github.com/pdfcpu/pdfcpu/pkg/api"
	"github.com/spf13/cobra"
)

func run(cmd *cobra.Command, file string) error {
	password, _ := cmd.Flags().GetString("password")
	output, _ := cmd.Flags().GetString("output")

	if output == "" {
		output = file
	}

	conf := api.LoadConfiguration()
	conf.UserPW = password

	if err := api.DecryptFile(file, output, conf); err != nil {
		return fmt.Errorf("decrypt failed: %w", err)
	}
	fmt.Fprintf(cmd.OutOrStdout(), "Decrypted %s\n", output)
	return nil
}
