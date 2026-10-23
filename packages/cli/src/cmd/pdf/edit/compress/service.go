package compress

import (
	"context"
	"fmt"

	"github.com/pdfcpu/pdfcpu/pkg/api"
	"github.com/spf13/cobra"
)

func run(cmd *cobra.Command, file string) error {
	output, _ := cmd.Flags().GetString("output")
	if output == "" {
		output = file
	}

	ctx := context.Background()
	conf, err := api.LoadConfiguration(api.ConfigurationOptions{})
	if err != nil {
		return fmt.Errorf("cannot load config: %w", err)
	}
	if err := api.OptimizeFile(ctx, file, output, conf, nil); err != nil {
		return fmt.Errorf("compress failed: %w", err)
	}
	fmt.Fprintf(cmd.OutOrStdout(), "Compressed %s\n", output)
	return nil
}
