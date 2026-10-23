package annotate

import (
	"fmt"

	"github.com/pdfcpu/pdfcpu/pkg/api"
	"github.com/pdfcpu/pdfcpu/pkg/pdfcpu/model"
	"github.com/pdfcpu/pdfcpu/pkg/pdfcpu/types"
	"github.com/spf13/cobra"
)

func run(cmd *cobra.Command, file string) error {
	text, _ := cmd.Flags().GetString("text")
	page, _ := cmd.Flags().GetInt("page")
	x, _ := cmd.Flags().GetFloat64("x")
	y, _ := cmd.Flags().GetFloat64("y")
	output, _ := cmd.Flags().GetString("output")

	if text == "" {
		return fmt.Errorf("--text is required")
	}

	if output == "" {
		output = file
	}

	conf := api.LoadConfiguration()

	ann := model.NewAnnotation(
		model.AnnFreeText,
		"",
		*types.NewRectangle(x, y, x+200, y+30),
		0,
		text,
		"",
		"",
		model.AnnPrint,
		nil,
		0,
		0,
		0,
	)

	if err := api.AddAnnotationsFile(file, output, []string{fmt.Sprintf("%d", page)}, ann, conf, false); err != nil {
		return fmt.Errorf("add annotation failed: %w", err)
	}
	fmt.Fprintf(cmd.OutOrStdout(), "Added annotation to page %d of %s\n", page, output)
	return nil
}
