package create

import (
	"fmt"
	"image"
	"image/color"
	"image/png"
	"os"
	"strings"

	"github.com/pdfcpu/pdfcpu/pkg/api"
	"github.com/pdfcpu/pdfcpu/pkg/pdfcpu"
	"github.com/spf13/cobra"
	"golang.org/x/image/font"
	"golang.org/x/image/font/basicfont"
	"golang.org/x/image/math/fixed"
)

const (
	pageWidth  = 2480
	pageHeight = 3508
	margin     = 100
	fontSize   = 14
)

func run(cmd *cobra.Command) error {
	text, _ := cmd.Flags().GetString("text")
	fileText, _ := cmd.Flags().GetString("file")
	output, _ := cmd.Flags().GetString("output")

	content := text
	if fileText != "" {
		data, err := os.ReadFile(fileText)
		if err != nil {
			return fmt.Errorf("cannot read %s: %w", fileText, err)
		}
		if content != "" {
			content += "\n" + string(data)
		} else {
			content = string(data)
		}
	}
	if content == "" {
		return fmt.Errorf("provide text via --text or --file")
	}

	img := image.NewRGBA(image.Rect(0, 0, pageWidth, pageHeight))
	bg := color.RGBA{255, 255, 255, 255}
	for x := 0; x < pageWidth; x++ {
		for y := 0; y < pageHeight; y++ {
			img.Set(x, y, bg)
		}
	}

	face := basicfont.Face7x13
	d := &font.Drawer{
		Dst:  img,
		Src:  image.NewUniform(color.Black),
		Face: face,
	}
	lineHeight := face.Metrics().Height.Ceil() + 4
	d.Dot = fixed.P(margin, margin+lineHeight)

	lines := strings.Split(content, "\n")
	for _, line := range lines {
		if d.Dot.Y.Ceil()+lineHeight > pageHeight-margin {
			break
		}
		d.Dot.X = fixed.I(margin)
		d.DrawString(line)
		d.Dot.Y += fixed.I(lineHeight)
	}

	tmpFile, err := os.CreateTemp("", "pdfcreate_*.png")
	if err != nil {
		return fmt.Errorf("cannot create temp file: %w", err)
	}
	tmpPath := tmpFile.Name()
	defer os.Remove(tmpPath)

	if err := png.Encode(tmpFile, img); err != nil {
		tmpFile.Close()
		return fmt.Errorf("cannot encode image: %w", err)
	}
	tmpFile.Close()

	conf := api.LoadConfiguration()
	imp := pdfcpu.DefaultImportConfig()

	if err := api.ImportImagesFile([]string{tmpPath}, output, imp, conf); err != nil {
		return fmt.Errorf("create PDF failed: %w", err)
	}
	fmt.Fprintf(cmd.OutOrStdout(), "Created %s\n", output)
	return nil
}
