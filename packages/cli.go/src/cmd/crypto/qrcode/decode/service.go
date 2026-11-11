package decode

import (
	"encoding/json"
	"fmt"
	"image"
	_ "image/jpeg"
	_ "image/png"
	"os"

	"github.com/makiuchi-d/gozxing"
	"github.com/makiuchi-d/gozxing/qrcode"
)

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

	reader := qrcode.NewQRCodeReader()
	result, err := reader.Decode(bitmap, nil)
	if err != nil {
		return fmt.Errorf("decoding QR code: %w", err)
	}

	if jsonOutput {
		b, _ := json.MarshalIndent(map[string]any{
			"text": result.GetText(),
		}, "", "  ")
		fmt.Println(string(b))
	} else {
		fmt.Println(result.GetText())
	}
	return nil
}
