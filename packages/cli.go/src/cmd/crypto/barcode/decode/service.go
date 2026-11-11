package decode

import (
	"encoding/json"
	"fmt"
	"image"
	_ "image/jpeg"
	_ "image/png"
	"os"

	"github.com/makiuchi-d/gozxing"
	"github.com/makiuchi-d/gozxing/oned"
)

type readerEntry struct {
	newReader func() gozxing.Reader
	name      string
}

var readers = []readerEntry{
	{func() gozxing.Reader { return oned.NewCode128Reader() }, "code128"},
	{func() gozxing.Reader { return oned.NewCode39Reader() }, "code39"},
	{func() gozxing.Reader { return oned.NewCode93Reader() }, "code93"},
	{func() gozxing.Reader { return oned.NewCodaBarReader() }, "codabar"},
	{func() gozxing.Reader { return oned.NewEAN13Reader() }, "ean13"},
	{func() gozxing.Reader { return oned.NewEAN8Reader() }, "ean8"},
	{func() gozxing.Reader { return oned.NewUPCAReader() }, "upca"},
	{func() gozxing.Reader { return oned.NewUPCEReader() }, "upce"},
	{func() gozxing.Reader { return oned.NewITFReader() }, "itf"},
}

func runDecode(imagePath string, jsonOutput bool) error {
	f, err := os.Open(imagePath)
	if err != nil {
		return fmt.Errorf("opening image: %w", err)
	}
	defer f.Close()

	img, _, err := image.Decode(f)
	if err != nil {
		return fmt.Errorf("decoding image: %w", err)
	}

	bitmap, err := gozxing.NewBinaryBitmapFromImage(img)
	if err != nil {
		return fmt.Errorf("creating bitmap: %w", err)
	}

	var lastErr error
	for _, re := range readers {
		reader := re.newReader()
		result, err := reader.Decode(bitmap, nil)
		if err == nil {
			if jsonOutput {
				b, _ := json.MarshalIndent(map[string]any{
					"text":   result.GetText(),
					"format": re.name,
				}, "", "  ")
				fmt.Println(string(b))
			} else {
				fmt.Println(result.GetText())
			}
			return nil
		}
		lastErr = err
	}

	return fmt.Errorf("decoding barcode: %w", lastErr)
}
