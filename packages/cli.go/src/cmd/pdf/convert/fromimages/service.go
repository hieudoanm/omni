package fromimages

import (
	"context"
	"fmt"

	"github.com/pdfcpu/pdfcpu/pkg/api"
	"github.com/pdfcpu/pdfcpu/pkg/pdfcpu"
	"github.com/spf13/cobra"
)

func run(cmd *cobra.Command, imageFiles []string) error {
	output, _ := cmd.Flags().GetString("output")

	ctx := context.Background()
	conf, err := api.LoadConfiguration(api.ConfigurationOptions{})
	if err != nil {
		return fmt.Errorf("cannot load config: %w", err)
	}
	imp := pdfcpu.DefaultImportConfig()

	if err := api.ImportImagesFile(ctx, imageFiles, output, imp, conf); err != nil {
		return fmt.Errorf("import images failed: %w", err)
	}
	fmt.Fprintf(cmd.OutOrStdout(), "Created %s from %d image(s)\n", output, len(imageFiles))
	return nil
}
