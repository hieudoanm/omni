package split

import (
	"encoding/json"
	"fmt"
	"image"
	"path/filepath"

	"github.com/disintegration/imaging"
)

type tileResult struct {
	Tile   string `json:"tile"`
	Path   string `json:"path"`
	Width  int    `json:"width"`
	Height int    `json:"height"`
}

type result struct {
	Status string       `json:"status"`
	Input  string       `json:"input"`
	Tiles  []tileResult `json:"tiles"`
}

func runSplit(inputPath string, jsonOut bool) error {
	src, err := imaging.Open(inputPath)
	if err != nil {
		return fmt.Errorf("open: %w", err)
	}

	bounds := src.Bounds()
	tileW := bounds.Dx() / splitCols
	tileH := bounds.Dy() / splitRows

	base := outputDir
	if base == "" {
		base = filepath.Dir(inputPath)
	}

	var tiles []tileResult

	for row := 0; row < splitRows; row++ {
		for col := 0; col < splitCols; col++ {
			x := col * tileW
			y := row * tileH
			rect := image.Rect(x, y, x+tileW, y+tileH)
			tile := imaging.Crop(src, rect)

			name := fmt.Sprintf("tile_%d_%d.png", row, col)
			tilePath := filepath.Join(base, name)

			if err := imaging.Save(tile, tilePath); err != nil {
				return fmt.Errorf("save %s: %w", name, err)
			}

			tiles = append(tiles, tileResult{
				Tile:   name,
				Path:   tilePath,
				Width:  tileW,
				Height: tileH,
			})

			if !jsonOut {
				fmt.Println(tilePath)
			}
		}
	}

	if jsonOut {
		b, _ := json.Marshal(result{
			Status: "ok",
			Input:  inputPath,
			Tiles:  tiles,
		})
		fmt.Println(string(b))
	}
	return nil
}
