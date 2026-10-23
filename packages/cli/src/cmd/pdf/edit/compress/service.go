package compress

import (
	"fmt"

	"github.com/pdfcpu/pdfcpu/pkg/api"
	"github.com/spf13/cobra"
)

func run(cmd *cobra.Command, file string) error {
	output, _ := cmd.Flags().GetString("output")
	if output == "" {
		output = file
	}

	conf := api.LoadConfiguration()
	if err := api.OptimizeFile(file, output, conf); err != nil {
		return fmt.Errorf("compress failed: %w", err)
	}
	fmt.Fprintf(cmd.OutOrStdout(), "Compressed %s\n", output)
	return nil
}
