package watermark

import (
	"fmt"
	"strings"

	"github.com/pdfcpu/pdfcpu/pkg/api"
	"github.com/spf13/cobra"
)

func run(cmd *cobra.Command, file string) error {
	text, _ := cmd.Flags().GetString("text")
	output, _ := cmd.Flags().GetString("output")
	pages, _ := cmd.Flags().GetString("pages")

	if output == "" {
		output = file
	}

	var selected []string
	if pages != "1-" {
		selected = strings.Split(pages, ",")
	}

	conf := api.LoadConfiguration()
	if err := api.AddTextWatermarksFile(file, output, selected, false, text, "", conf); err != nil {
		return fmt.Errorf("watermark failed: %w", err)
	}
	fmt.Fprintf(cmd.OutOrStdout(), "Added watermark to %s\n", output)
	return nil
}
