package round

import (
	"encoding/json"
	"fmt"
	"image"
	"image/color"
	"image/draw"
	"image/png"
	"os"
	"path/filepath"

	"github.com/disintegration/imaging"
)

type result struct {
	Status string `json:"status"`
	Input  string `json:"input"`
	Output string `json:"output"`
	Radius int    `json:"radius"`
}

func runRound(inputPath string, jsonOut bool) error {
	src, err := imaging.Open(inputPath)
	if err != nil {
		return fmt.Errorf("open: %w", err)
	}

	bounds := src.Bounds()
	w := bounds.Dx()
	h := bounds.Dy()

	radius := roundRadius
	if radius == 0 {
		if w < h {
			radius = w / 2
		} else {
			radius = h / 2
		}
	}

	dst := image.NewNRGBA(image.Rect(0, 0, w, h))

	mask := image.NewAlpha(image.Rect(0, 0, w, h))
	cx, cy := w/2, h/2
	r2 := radius * radius
	for y := 0; y < h; y++ {
		for x := 0; x < w; x++ {
			dx, dy := x-cx, y-cy
			if dx*dx+dy*dy <= r2 {
				mask.SetAlpha(x, y, color.Alpha{A: 255})
			}
		}
	}

	draw.DrawMask(dst, dst.Bounds(), src, bounds.Min, mask, bounds.Min, draw.Over)

	outPath := output
	if outPath == "" {
		ext := filepath.Ext(inputPath)
		outPath = inputPath[:len(inputPath)-len(ext)] + "_rounded.png"
	}

	f, err := os.Create(outPath)
	if err != nil {
		return fmt.Errorf("create: %w", err)
	}
	defer f.Close()

	if err := png.Encode(f, dst); err != nil {
		return fmt.Errorf("encode: %w", err)
	}

	if jsonOut {
		b, _ := json.Marshal(result{
			Status: "ok",
			Input:  inputPath,
			Output: outPath,
			Radius: radius,
		})
		fmt.Println(string(b))
	} else {
		fmt.Println(outPath)
	}
	return nil
}
