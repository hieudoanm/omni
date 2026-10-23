package pixelate

import (
	"encoding/json"
	"fmt"
	"image"
	"image/color"
	"path/filepath"

	"github.com/disintegration/imaging"
)

type result struct {
	Status string `json:"status"`
	Input  string `json:"input"`
	Output string `json:"output"`
	Size   int    `json:"size"`
}

func runPixelate(inputPath string, jsonOut bool) error {
	src, err := imaging.Open(inputPath)
	if err != nil {
		return fmt.Errorf("open: %w", err)
	}

	dst := pixelateImage(src, pixelSize)

	outPath := output
	if outPath == "" {
		ext := filepath.Ext(inputPath)
		outPath = inputPath[:len(inputPath)-len(ext)] + "_pixelated" + ext
	}

	if err := imaging.Save(dst, outPath); err != nil {
		return fmt.Errorf("save: %w", err)
	}

	if jsonOut {
		b, _ := json.Marshal(result{
			Status: "ok",
			Input:  inputPath,
			Output: outPath,
			Size:   pixelSize,
		})
		fmt.Println(string(b))
	} else {
		fmt.Println(outPath)
	}
	return nil
}

func pixelateImage(img image.Image, size int) *image.NRGBA {
	bounds := img.Bounds()
	dst := image.NewNRGBA(bounds)

	for y := bounds.Min.Y; y < bounds.Max.Y; y += size {
		for x := bounds.Min.X; x < bounds.Max.X; x += size {
			var tr, tg, tb, ta uint64
			count := 0
			for dy := 0; dy < size && y+dy < bounds.Max.Y; dy++ {
				for dx := 0; dx < size && x+dx < bounds.Max.X; dx++ {
					r, g, b, a := img.At(x+dx, y+dy).RGBA()
					tr += uint64(r)
					tg += uint64(g)
					tb += uint64(b)
					ta += uint64(a)
					count++
				}
			}
			if count == 0 {
				continue
			}
			avgR := uint8((tr / uint64(count)) >> 8)
			avgG := uint8((tg / uint64(count)) >> 8)
			avgB := uint8((tb / uint64(count)) >> 8)
			avgA := uint8((ta / uint64(count)) >> 8)
			c := color.NRGBA{R: avgR, G: avgG, B: avgB, A: avgA}
			for dy := 0; dy < size && y+dy < bounds.Max.Y; dy++ {
				for dx := 0; dx < size && x+dx < bounds.Max.X; dx++ {
					dst.SetNRGBA(x+dx, y+dy, c)
				}
			}
		}
	}

	return dst
}
