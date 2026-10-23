package sharpen

import (
	"encoding/json"
	"fmt"
	"path/filepath"

	"github.com/disintegration/imaging"
)

type result struct {
	Status string  `json:"status"`
	Input  string  `json:"input"`
	Output string  `json:"output"`
	Amount float64 `json:"amount"`
}

func runSharpen(inputPath string, jsonOut bool) error {
	img, err := imaging.Open(inputPath)
	if err != nil {
		return fmt.Errorf("open: %w", err)
	}

	dst := imaging.Sharpen(img, amount)

	outPath := output
	if outPath == "" {
		ext := filepath.Ext(inputPath)
		outPath = inputPath[:len(inputPath)-len(ext)] + "_sharpened" + ext
	}

	if err := imaging.Save(dst, outPath); err != nil {
		return fmt.Errorf("save: %w", err)
	}

	if jsonOut {
		b, _ := json.Marshal(result{
			Status: "ok",
			Input:  inputPath,
			Output: outPath,
			Amount: amount,
		})
		fmt.Println(string(b))
	} else {
		fmt.Println(outPath)
	}
	return nil
}
