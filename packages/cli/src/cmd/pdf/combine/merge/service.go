package merge

import (
	"context"
	"fmt"
	"os"

	"github.com/pdfcpu/pdfcpu/pkg/api"
	"github.com/spf13/cobra"
)

func run(cmd *cobra.Command, files []string) error {
	output, _ := cmd.Flags().GetString("output")

	ctx := context.Background()
	conf, err := api.LoadConfiguration(api.ConfigurationOptions{})
	if err != nil {
		return fmt.Errorf("cannot load config: %w", err)
	}
	f, err := os.Create(output)
	if err != nil {
		return fmt.Errorf("cannot create %s: %w", output, err)
	}
	defer f.Close()

	if err := api.Merge(ctx, output, files, f, conf, false); err != nil {
		return fmt.Errorf("merge failed: %w", err)
	}
	fmt.Fprintf(cmd.OutOrStdout(), "Merged %d files into %s\n", len(files), output)
	return nil
}
