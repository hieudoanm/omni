package compress

import (
	"encoding/json"
	"fmt"
	"image/jpeg"
	"image/png"
	"os"
	"path/filepath"
	"strings"

	"github.com/disintegration/imaging"
)

type result struct {
	Status  string `json:"status"`
	Input   string `json:"input"`
	Output  string `json:"output"`
	Format  string `json:"format"`
	Quality int    `json:"quality"`
}

func runCompress(inputPath string, jsonOut bool) error {
	src, err := imaging.Open(inputPath)
	if err != nil {
		return fmt.Errorf("open: %w", err)
	}

	outPath := output
	if outPath == "" {
		ext := filepath.Ext(inputPath)
		outPath = inputPath[:len(inputPath)-len(ext)] + "_compressed" + ext
	}

	outFmt := format
	if outFmt == "" {
		ext := strings.TrimLeft(filepath.Ext(inputPath), ".")
		outFmt = ext
	}

	outFmt = strings.ToLower(outFmt)

	f, err := os.Create(outPath)
	if err != nil {
		return fmt.Errorf("create: %w", err)
	}
	defer f.Close()

	switch outFmt {
	case "jpg", "jpeg":
		err = jpeg.Encode(f, src, &jpeg.Options{Quality: quality})
	case "png":
		err = png.Encode(f, src)
	default:
		return fmt.Errorf("unsupported format: %s", outFmt)
	}
	if err != nil {
		return fmt.Errorf("encode: %w", err)
	}

	if jsonOut {
		b, _ := json.Marshal(result{
			Status:  "ok",
			Input:   inputPath,
			Output:  outPath,
			Format:  outFmt,
			Quality: quality,
		})
		fmt.Println(string(b))
	} else {
		fmt.Println(outPath)
	}
	return nil
}
