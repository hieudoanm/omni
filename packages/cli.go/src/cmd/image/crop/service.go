package crop

import (
	"encoding/json"
	"fmt"
	"image"
	"path/filepath"

	"github.com/disintegration/imaging"
)

type result struct {
	Status string `json:"status"`
	Input  string `json:"input"`
	Output string `json:"output"`
	Width  int    `json:"width"`
	Height int    `json:"height"`
}

func runCrop(inputPath string, jsonOut bool) error {
	img, err := imaging.Open(inputPath)
	if err != nil {
		return fmt.Errorf("open: %w", err)
	}

	var dst *image.NRGBA
	if center {
		if cropW == 0 || cropH == 0 {
			return fmt.Errorf("width and height required for center crop")
		}
		dst = imaging.CropCenter(img, cropW, cropH)
	} else {
		bounds := img.Bounds()
		x := cropX
		y := cropY
		w := cropW
		h := cropH
		if w == 0 {
			w = bounds.Dx() - x
		}
		if h == 0 {
			h = bounds.Dy() - y
		}
		dst = imaging.Crop(img, image.Rect(x, y, x+w, y+h))
	}

	outPath := output
	if outPath == "" {
		ext := filepath.Ext(inputPath)
		outPath = inputPath[:len(inputPath)-len(ext)] + "_cropped" + ext
	}

	if err := imaging.Save(dst, outPath); err != nil {
		return fmt.Errorf("save: %w", err)
	}

	if jsonOut {
		b, _ := json.Marshal(result{
			Status: "ok",
			Input:  inputPath,
			Output: outPath,
			Width:  dst.Bounds().Dx(),
			Height: dst.Bounds().Dy(),
		})
		fmt.Println(string(b))
	} else {
		fmt.Println(outPath)
	}
	return nil
}
