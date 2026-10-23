package convert

import (
	"fmt"
	"image"
	"image/gif"
	"image/jpeg"
	"image/png"
	"os"
	"path/filepath"
	"strings"
)

var outputFormat, output string

func runConvert(inputPath string) error {
	outFmt := outputFormat
	if outFmt == "" {
		outFmt = "png"
	}
	ext := "." + outFmt
	outPath := output
	if outPath == "" {
		outPath = removeExt(inputPath) + ext
	}

	src, err := os.Open(inputPath)
	if err != nil {
		return fmt.Errorf("open input: %w", err)
	}
	defer src.Close()

	img, _, err := image.Decode(src)
	if err != nil {
		return fmt.Errorf("decode: %w", err)
	}

	dst, err := os.Create(outPath)
	if err != nil {
		return fmt.Errorf("create output: %w", err)
	}
	defer dst.Close()

	switch strings.ToLower(outFmt) {
	case "png":
		err = png.Encode(dst, img)
	case "jpg", "jpeg":
		err = jpeg.Encode(dst, img, &jpeg.Options{Quality: 90})
	case "gif":
		err = gif.Encode(dst, img, &gif.Options{})
	default:
		err = fmt.Errorf("unsupported format: %s", outputFormat)
	}
	if err != nil {
		return fmt.Errorf("encode: %w", err)
	}

	fmt.Printf("converted %s -> %s\n", inputPath, outPath)
	return nil
}

func removeExt(path string) string {
	ext := filepath.Ext(path)
	return path[:len(path)-len(ext)]
}
