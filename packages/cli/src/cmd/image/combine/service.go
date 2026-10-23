package combine

import (
	"encoding/json"
	"fmt"
	"image"
	"image/draw"
	"path/filepath"

	"github.com/disintegration/imaging"
)

type result struct {
	Status    string `json:"status"`
	Input1    string `json:"input1"`
	Input2    string `json:"input2"`
	Output    string `json:"output"`
	Direction string `json:"direction"`
	Width     int    `json:"width"`
	Height    int    `json:"height"`
}

func runCombine(inputPath1, inputPath2 string, jsonOut bool) error {
	img1, err := imaging.Open(inputPath1)
	if err != nil {
		return fmt.Errorf("open %s: %w", inputPath1, err)
	}
	img2, err := imaging.Open(inputPath2)
	if err != nil {
		return fmt.Errorf("open %s: %w", inputPath2, err)
	}

	b1 := img1.Bounds()
	b2 := img2.Bounds()

	var dst *image.NRGBA
	if direction == "vertical" {
		w := b1.Dx()
		if b2.Dx() > w {
			w = b2.Dx()
		}
		h := b1.Dy() + b2.Dy()
		dst = image.NewNRGBA(image.Rect(0, 0, w, h))
		draw.Draw(dst, image.Rect(0, 0, b1.Dx(), b1.Dy()), img1, b1.Min, draw.Src)
		draw.Draw(dst, image.Rect(0, b1.Dy(), b2.Dx(), b1.Dy()+b2.Dy()), img2, b2.Min, draw.Src)
	} else {
		w := b1.Dx() + b2.Dx()
		h := b1.Dy()
		if b2.Dy() > h {
			h = b2.Dy()
		}
		dst = image.NewNRGBA(image.Rect(0, 0, w, h))
		draw.Draw(dst, image.Rect(0, 0, b1.Dx(), b1.Dy()), img1, b1.Min, draw.Src)
		draw.Draw(dst, image.Rect(b1.Dx(), 0, b1.Dx()+b2.Dx(), b2.Dy()), img2, b2.Min, draw.Src)
	}

	outPath := output
	if outPath == "" {
		ext := filepath.Ext(inputPath1)
		outPath = inputPath1[:len(inputPath1)-len(ext)] + "_combined" + ext
	}

	if err := imaging.Save(dst, outPath); err != nil {
		return fmt.Errorf("save: %w", err)
	}

	if jsonOut {
		b, _ := json.Marshal(result{
			Status:    "ok",
			Input1:    inputPath1,
			Input2:    inputPath2,
			Output:    outPath,
			Direction: direction,
			Width:     dst.Bounds().Dx(),
			Height:    dst.Bounds().Dy(),
		})
		fmt.Println(string(b))
	} else {
		fmt.Println(outPath)
	}
	return nil
}
