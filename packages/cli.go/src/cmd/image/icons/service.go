package icons

import (
	"fmt"
	"image"
	"image/png"
	"os"
	"path/filepath"
	"strings"

	"golang.org/x/image/draw"
)

var sizes []int

func runIcons(inputPath string) error {
	srcFile, err := os.Open(inputPath)
	if err != nil {
		return fmt.Errorf("open %s: %w", inputPath, err)
	}
	defer srcFile.Close()

	srcImg, _, err := image.Decode(srcFile)
	if err != nil {
		return fmt.Errorf("decode %s: %w", inputPath, err)
	}

	baseDir := filepath.Dir(inputPath)
	ext := filepath.Ext(inputPath)
	base := strings.TrimSuffix(filepath.Base(inputPath), ext)

	for _, size := range sizes {
		outPath := filepath.Join(baseDir, fmt.Sprintf("%s-%d.png", base, size))

		dst := image.NewRGBA(image.Rect(0, 0, size, size))
		draw.ApproxBiLinear.Scale(dst, dst.Bounds(), srcImg, srcImg.Bounds(), draw.Over, nil)

		dstFile, err := os.Create(outPath)
		if err != nil {
			return fmt.Errorf("create %s: %w", outPath, err)
		}

		if err := png.Encode(dstFile, dst); err != nil {
			dstFile.Close()
			return fmt.Errorf("encode %s: %w", outPath, err)
		}
		dstFile.Close()

		fmt.Printf("generated %s\n", outPath)
	}
	return nil
}
