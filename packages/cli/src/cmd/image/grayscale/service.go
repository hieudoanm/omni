package grayscale

import (
	"encoding/json"
	"fmt"
	"path/filepath"

	"github.com/disintegration/imaging"
)

type result struct {
	Status string `json:"status"`
	Input  string `json:"input"`
	Output string `json:"output"`
}

func runGrayscale(inputPath string, jsonOut bool) error {
	img, err := imaging.Open(inputPath)
	if err != nil {
		return fmt.Errorf("open: %w", err)
	}

	dst := imaging.Grayscale(img)

	outPath := output
	if outPath == "" {
		ext := filepath.Ext(inputPath)
		outPath = inputPath[:len(inputPath)-len(ext)] + "_grayscale" + ext
	}

	if err := imaging.Save(dst, outPath); err != nil {
		return fmt.Errorf("save: %w", err)
	}

	if jsonOut {
		b, _ := json.Marshal(result{
			Status: "ok",
			Input:  inputPath,
			Output: outPath,
		})
		fmt.Println(string(b))
	} else {
		fmt.Println(outPath)
	}
	return nil
}
