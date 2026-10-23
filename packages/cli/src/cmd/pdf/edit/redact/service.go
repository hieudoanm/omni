package redact

import (
	"fmt"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/pdfcpu/pdfcpu/pkg/api"
	"github.com/pdfcpu/pdfcpu/pkg/pdfcpu/color"
	"github.com/pdfcpu/pdfcpu/pkg/pdfcpu/model"
	"github.com/pdfcpu/pdfcpu/pkg/pdfcpu/types"
	"github.com/spf13/cobra"
)

type region struct {
	page       int
	x, y, w, h float64
}

func parseRegion(s string) (region, error) {
	parts := strings.SplitN(s, ":", 2)
	if len(parts) != 2 {
		return region{}, fmt.Errorf("invalid region format %q (want page:x,y,w,h)", s)
	}
	page, err := strconv.Atoi(parts[0])
	if err != nil {
		return region{}, fmt.Errorf("invalid page number %q", parts[0])
	}
	coords := strings.Split(parts[1], ",")
	if len(coords) != 4 {
		return region{}, fmt.Errorf("invalid region coords %q (want x,y,w,h)", parts[1])
	}
	var vals [4]float64
	for i, c := range coords {
		v, err := strconv.ParseFloat(strings.TrimSpace(c), 64)
		if err != nil {
			return region{}, fmt.Errorf("invalid coordinate %q", c)
		}
		vals[i] = v
	}
	return region{page: page, x: vals[0], y: vals[1], w: vals[2], h: vals[3]}, nil
}

func run(cmd *cobra.Command, file string) error {
	pages, _ := cmd.Flags().GetString("pages")
	regions, _ := cmd.Flags().GetStringSlice("region")
	output, _ := cmd.Flags().GetString("output")

	if output == "" {
		ext := filepath.Ext(file)
		base := strings.TrimSuffix(file, ext)
		output = base + ".redacted.pdf"
	}

	conf := api.LoadConfiguration()

	if pages != "" && len(regions) > 0 {
		return fmt.Errorf("use either --pages or --region, not both")
	}

	if pages != "" {
		selected := strings.Split(pages, ",")
		if err := api.RemovePagesFile(file, output, selected, conf); err != nil {
			return fmt.Errorf("page redact failed: %w", err)
		}
		fmt.Fprintf(cmd.OutOrStdout(), "Removed pages %s -> %s\n", pages, output)
		return nil
	}

	if len(regions) > 0 {
		annMap := make(map[int][]model.AnnotationRenderer)
		for _, r := range regions {
			reg, err := parseRegion(r)
			if err != nil {
				return err
			}
			rect := types.Rectangle{
				LL: types.Point{X: reg.x, Y: reg.y},
				UR: types.Point{X: reg.x + reg.w, Y: reg.y + reg.h},
			}
			ann := model.NewSquareAnnotation(
				rect,
				0,            // apObjNr
				"",           // contents
				"",           // id
				"",           // modDate
				0,            // f
				nil,          // col (border color)
				"",           // title
				nil,          // popupIndRef
				nil,          // ca (opacity)
				"",           // rc
				"",           // subject
				&color.Black, // fillCol
				0, 0, 0, 0,   // margins
				0,     // borderWidth
				0,     // borderStyle
				false, // cloudyBorder
				0,     // cloudyBorderIntensity
			)
			annMap[reg.page] = append(annMap[reg.page], ann)
		}
		if err := api.AddAnnotationsMapFile(file, output, annMap, conf, false); err != nil {
			return fmt.Errorf("region redact failed: %w", err)
		}
		fmt.Fprintf(cmd.OutOrStdout(), "Redacted %d regions -> %s\n", len(regions), output)
		return nil
	}

	return fmt.Errorf("specify --pages or --region")
}
