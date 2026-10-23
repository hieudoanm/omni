package images

import (
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

	conf := api.LoadConfiguration()
	if err := api.ExtractImagesFile(file, output, nil, conf); err != nil {
		return fmt.Errorf("image extraction failed: %w", err)
	}
	fmt.Fprintf(cmd.OutOrStdout(), "Extracted images to %s\n", output)
	return nil
}
