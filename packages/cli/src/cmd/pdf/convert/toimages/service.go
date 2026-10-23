package toimages

import (
	"context"
	"fmt"
	"path/filepath"
	"strings"

	"github.com/pdfcpu/pdfcpu/pkg/api"
	"github.com/spf13/cobra"
)

func run(cmd *cobra.Command, file string) error {
	output, _ := cmd.Flags().GetString("output")

	if output == "" {
		ext := filepath.Ext(file)
		base := strings.TrimSuffix(file, ext)
		output = base + "_images"
	}

	ctx := context.Background()
	conf, err := api.LoadConfiguration(api.ConfigurationOptions{})
	if err != nil {
		return fmt.Errorf("cannot load config: %w", err)
	}
	if err := api.ExtractImagesFile(ctx, file, output, nil, conf); err != nil {
		return fmt.Errorf("image export failed: %w", err)
	}
	fmt.Fprintf(cmd.OutOrStdout(), "Exported images to %s\n", output)
	return nil
}
