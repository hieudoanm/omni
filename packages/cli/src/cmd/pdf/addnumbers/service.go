package addnumbers

import (
	"fmt"
	"strings"

	"github.com/pdfcpu/pdfcpu/pkg/api"
	"github.com/pdfcpu/pdfcpu/pkg/pdfcpu/model"
	"github.com/pdfcpu/pdfcpu/pkg/pdfcpu/types"
	"github.com/spf13/cobra"
)

func positionAnchor(pos string) (types.Anchor, error) {
	switch strings.ToLower(pos) {
	case "top-left":
		return types.TopLeft, nil
	case "top-center":
		return types.TopCenter, nil
	case "top-right":
		return types.TopRight, nil
	case "bottom-left":
		return types.BottomLeft, nil
	case "bottom-center":
		return types.BottomCenter, nil
	case "bottom-right":
		return types.BottomRight, nil
	default:
		return types.Center, fmt.Errorf("invalid position: %s", pos)
	}
}

func run(cmd *cobra.Command, file string) error {
	format, _ := cmd.Flags().GetString("format")
	start, _ := cmd.Flags().GetInt("start")
	pos, _ := cmd.Flags().GetString("position")
	output, _ := cmd.Flags().GetString("output")

	if output == "" {
		output = file
	}

	anchor, err := positionAnchor(pos)
	if err != nil {
		return err
	}

	conf := api.LoadConfiguration()

	ctx, err := api.ReadContextFile(file)
	if err != nil {
		return fmt.Errorf("cannot read PDF: %w", err)
	}
	totalPages := ctx.PageCount

	wmMap := make(map[int]*model.Watermark)
	for i := 1; i <= totalPages; i++ {
		pageNum := start + i - 1
		text := format
		text = strings.ReplaceAll(text, "{n}", fmt.Sprintf("%d", pageNum))
		text = strings.ReplaceAll(text, "{total}", fmt.Sprintf("%d", totalPages))

		wm, err := api.TextWatermark(text, "", true, false, types.POINTS)
		if err != nil {
			return fmt.Errorf("cannot create watermark: %w", err)
		}
		wm.Pos = anchor
		wmMap[i] = wm
	}

	if err := api.AddWatermarksMapFile(file, output, wmMap, conf); err != nil {
		return fmt.Errorf("add page numbers failed: %w", err)
	}
	fmt.Fprintf(cmd.OutOrStdout(), "Added page numbers to %s\n", output)
	return nil
}
