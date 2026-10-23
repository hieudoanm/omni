package rotate

import (
	"fmt"
	"strings"

	"github.com/pdfcpu/pdfcpu/pkg/api"
	"github.com/spf13/cobra"
)

func run(cmd *cobra.Command, file string) error {
	angle, _ := cmd.Flags().GetInt("angle")
	pages, _ := cmd.Flags().GetString("pages")
	output, _ := cmd.Flags().GetString("output")

	if output == "" {
		output = file
	}

	var rotation int
	switch angle {
	case 90:
		rotation = 90
	case 180:
		rotation = 180
	case 270:
		rotation = 270
	default:
		return fmt.Errorf("invalid angle: %d (use 90, 180, or 270)", angle)
	}

	var selected []string
	if pages != "1-" {
		selected = strings.Split(pages, ",")
	}

	conf := api.LoadConfiguration()
	if err := api.RotateFile(file, output, rotation, selected, conf); err != nil {
		return fmt.Errorf("rotate failed: %w", err)
	}
	fmt.Fprintf(cmd.OutOrStdout(), "Rotated pages %s by %d°\n", pages, angle)
	return nil
}
