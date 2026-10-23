package fromimages

import (
	"fmt"

	"github.com/pdfcpu/pdfcpu/pkg/api"
	"github.com/pdfcpu/pdfcpu/pkg/pdfcpu"
	"github.com/spf13/cobra"
)

func run(cmd *cobra.Command, imageFiles []string) error {
	output, _ := cmd.Flags().GetString("output")

	conf := api.LoadConfiguration()
	imp := pdfcpu.DefaultImportConfig()

	if err := api.ImportImagesFile(imageFiles, output, imp, conf); err != nil {
		return fmt.Errorf("import images failed: %w", err)
	}
	fmt.Fprintf(cmd.OutOrStdout(), "Created %s from %d image(s)\n", output, len(imageFiles))
	return nil
}
