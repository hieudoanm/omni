package crop

import (
	"fmt"
	"strings"

	"github.com/pdfcpu/pdfcpu/pkg/api"
	"github.com/pdfcpu/pdfcpu/pkg/pdfcpu/types"
	"github.com/spf13/cobra"
)

func run(cmd *cobra.Command, file string) error {
	bbox, _ := cmd.Flags().GetString("bbox")
	pages, _ := cmd.Flags().GetString("pages")
	output, _ := cmd.Flags().GetString("output")

	conf := api.LoadConfiguration()
	b, err := api.Box(bbox, types.POINTS)
	if err != nil {
		return fmt.Errorf("invalid bounding box: %w", err)
	}

	var selected []string
	if pages != "" {
		selected = strings.Split(pages, ",")
	}

	if err := api.CropFile(file, output, selected, b, conf); err != nil {
		return fmt.Errorf("crop failed: %w", err)
	}
	fmt.Fprintf(cmd.OutOrStdout(), "Cropped %s\n", file)
	return nil
}
