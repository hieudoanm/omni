package encode

import (
	"encoding/json"
	"fmt"
	"image"
	"image/color"
	"image/png"
	"os"
	"strings"

	"github.com/makiuchi-d/gozxing"
	"github.com/makiuchi-d/gozxing/oned"
)

type formatInfo struct {
	newWriter func() gozxing.Writer
	format    gozxing.BarcodeFormat
}

var barcodeFormats = map[string]formatInfo{
	"code128": {oned.NewCode128Writer, gozxing.BarcodeFormat_CODE_128},
	"code39":  {oned.NewCode39Writer, gozxing.BarcodeFormat_CODE_39},
	"code93":  {oned.NewCode93Writer, gozxing.BarcodeFormat_CODE_93},
	"codabar": {oned.NewCodaBarWriter, gozxing.BarcodeFormat_CODABAR},
	"ean13":   {oned.NewEAN13Writer, gozxing.BarcodeFormat_EAN_13},
	"ean8":    {oned.NewEAN8Writer, gozxing.BarcodeFormat_EAN_8},
	"upca":    {oned.NewUPCAWriter, gozxing.BarcodeFormat_UPC_A},
	"upce":    {oned.NewUPCEWriter, gozxing.BarcodeFormat_UPC_E},
	"itf":     {oned.NewITFWriter, gozxing.BarcodeFormat_ITF},
}

func runBarcode(data string, jsonOutput bool, inputFile, outputFile, formatStr string, width, height, margin int) error {
	if inputFile != "" {
		b, err := os.ReadFile(inputFile)
		if err != nil {
			return fmt.Errorf("reading input file: %w", err)
		}
		data = strings.TrimSpace(string(b))
	}

	if data == "" {
		return fmt.Errorf("no data provided; use --data, --input, or pass text as an argument")
	}

	fmtInfo, ok := barcodeFormats[strings.ToLower(formatStr)]
	if !ok {
		return fmt.Errorf("unsupported format %q", formatStr)
	}

	if jsonOutput {
		b, _ := json.MarshalIndent(map[string]any{
			"data":   data,
			"format": formatStr,
		}, "", "  ")
		fmt.Println(string(b))
		return nil
	}

	writer := fmtInfo.newWriter()
	matrix, err := writer.EncodeWithoutHint(data, fmtInfo.format, width, height)
	if err != nil {
		return fmt.Errorf("encoding barcode: %w", err)
	}

	if outputFile != "" {
		return writePNG(matrix, outputFile, margin)
	}

	renderTerminal(matrix)
	return nil
}

func renderTerminal(matrix *gozxing.BitMatrix) {
	mw := matrix.GetWidth()
	mh := matrix.GetHeight()

	rows := mh
	if rows > 3 {
		rows = 3
	}
	for y := 0; y < rows; y++ {
		for x := 0; x < mw; x++ {
			if matrix.Get(x, y) {
				fmt.Print("\033[40m  \033[0m")
			} else {
				fmt.Print("\033[47m  \033[0m")
			}
		}
		fmt.Println()
	}
	if mh > 3 {
		fmt.Printf("(%d rows omitted)\n", mh-3)
	}
}

func writePNG(matrix *gozxing.BitMatrix, path string, margin int) error {
	mw := matrix.GetWidth()
	mh := matrix.GetHeight()
	w := mw + 2*margin
	h := mh + 2*margin

	img := image.NewGray(image.Rect(0, 0, w, h))

	for y := 0; y < h; y++ {
		for x := 0; x < w; x++ {
			img.Set(x, y, color.Gray{Y: 255})
		}
	}

	for y := 0; y < mh; y++ {
		for x := 0; x < mw; x++ {
			if matrix.Get(x, y) {
				img.Set(x+margin, y+margin, color.Gray{Y: 0})
			}
		}
	}

	f, err := os.Create(path)
	if err != nil {
		return fmt.Errorf("creating output file: %w", err)
	}
	defer f.Close()

	if err := png.Encode(f, img); err != nil {
		return fmt.Errorf("encoding PNG: %w", err)
	}
	return nil
}
