package resize

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

func runResize(inputPath string, jsonOut bool) error {
	img, err := imaging.Open(inputPath)
	if err != nil {
		return fmt.Errorf("open: %w", err)
	}

	w := width
	h := height
	if w == 0 {
		w = img.Bounds().Dx()
	}
	if h == 0 {
		h = img.Bounds().Dy()
	}

	var dst *image.NRGBA
	switch fit {
	case "contain":
		dst = imaging.Fit(img, w, h, imaging.Lanczos)
	case "cover":
		dst = imaging.Fill(img, w, h, imaging.Center, imaging.Lanczos)
	case "fill":
		dst = imaging.Resize(img, w, h, imaging.Lanczos)
	case "none":
		dst = imaging.Resize(img, w, h, imaging.Lanczos)
	default:
		dst = imaging.Fit(img, w, h, imaging.Lanczos)
	}

	outPath := output
	if outPath == "" {
		ext := filepath.Ext(inputPath)
		outPath = inputPath[:len(inputPath)-len(ext)] + "_resized" + ext
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
