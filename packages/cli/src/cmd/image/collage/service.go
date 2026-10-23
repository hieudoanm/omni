package collage

import (
	"encoding/json"
	"fmt"
	"image"
	"image/draw"
	"path/filepath"

	"github.com/disintegration/imaging"
)

type result struct {
	Status string `json:"status"`
	Output string `json:"output"`
	Images int    `json:"images"`
	Rows   int    `json:"rows"`
	Cols   int    `json:"cols"`
	Width  int    `json:"width"`
	Height int    `json:"height"`
}

func runCollage(files []string, jsonOut bool) error {
	if len(files) == 0 {
		return fmt.Errorf("no input files provided")
	}
	var imgs []image.Image
	for _, f := range files {
		img, err := imaging.Open(f)
		if err != nil {
			return fmt.Errorf("open %s: %w", f, err)
		}
		imgs = append(imgs, img)
	}

	n := len(imgs)
	cols := collageCols
	rows := collageRows
	if rows == 0 {
		rows = (n + cols - 1) / cols
	}

	cellW, cellH := 0, 0
	for _, img := range imgs {
		b := img.Bounds()
		if b.Dx() > cellW {
			cellW = b.Dx()
		}
		if b.Dy() > cellH {
			cellH = b.Dy()
		}
	}

	w := cols * cellW
	h := rows * cellH
	dst := image.NewNRGBA(image.Rect(0, 0, w, h))

	for i, img := range imgs {
		if i >= rows*cols {
			break
		}
		row := i / cols
		col := i % cols
		x := col * cellW
		y := row * cellH
		resized := imaging.Fit(img, cellW, cellH, imaging.Lanczos)
		draw.Draw(dst, image.Rect(x, y, x+cellW, y+cellH), resized, resized.Bounds().Min, draw.Src)
	}

	outPath := output
	if outPath == "" {
		ext := filepath.Ext(files[0])
		outPath = files[0][:len(files[0])-len(ext)] + "_collage" + ext
	}

	if err := imaging.Save(dst, outPath); err != nil {
		return fmt.Errorf("save: %w", err)
	}

	if jsonOut {
		b, _ := json.Marshal(result{
			Status: "ok",
			Output: outPath,
			Images: n,
			Rows:   rows,
			Cols:   cols,
			Width:  dst.Bounds().Dx(),
			Height: dst.Bounds().Dy(),
		})
		fmt.Println(string(b))
	} else {
		fmt.Println(outPath)
	}
	return nil
}
