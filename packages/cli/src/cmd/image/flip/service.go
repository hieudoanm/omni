package flip

import (
	"encoding/json"
	"fmt"
	"image"
	"path/filepath"

	"github.com/disintegration/imaging"
)

type result struct {
	Status     string `json:"status"`
	Input      string `json:"input"`
	Output     string `json:"output"`
	Horizontal bool   `json:"horizontal"`
	Vertical   bool   `json:"vertical"`
}

func runFlip(inputPath string, jsonOut bool) error {
	img, err := imaging.Open(inputPath)
	if err != nil {
		return fmt.Errorf("open: %w", err)
	}

	var dst *image.NRGBA
	if vertical && !horizontal {
		dst = imaging.FlipV(img)
	} else {
		dst = imaging.FlipH(img)
	}

	outPath := output
	if outPath == "" {
		ext := filepath.Ext(inputPath)
		outPath = inputPath[:len(inputPath)-len(ext)] + "_flipped" + ext
	}

	if err := imaging.Save(dst, outPath); err != nil {
		return fmt.Errorf("save: %w", err)
	}

	if jsonOut {
		b, _ := json.Marshal(result{
			Status:     "ok",
			Input:      inputPath,
			Output:     outPath,
			Horizontal: horizontal,
			Vertical:   vertical,
		})
		fmt.Println(string(b))
	} else {
		fmt.Println(outPath)
	}
	return nil
}
