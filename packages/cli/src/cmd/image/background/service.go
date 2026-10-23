package background

import (
	"encoding/json"
	"fmt"
	"image/color"
	"math"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/disintegration/imaging"
)

type result struct {
	Status    string  `json:"status"`
	Input     string  `json:"input"`
	Output    string  `json:"output"`
	Color     string  `json:"color"`
	Threshold float64 `json:"threshold"`
}

func runBackground(inputPath string, jsonOut bool) error {
	src, err := imaging.Open(inputPath)
	if err != nil {
		return fmt.Errorf("open: %w", err)
	}

	bounds := src.Bounds()
	dst := imaging.Clone(src)

	rRef, gRef, bRef, _ := dst.At(0, 0).RGBA()
	refR := uint8(rRef >> 8)
	refG := uint8(gRef >> 8)
	refB := uint8(bRef >> 8)

	bg := parseColor(bgColor)

	maxDist := bgThreshold * 255 * math.Sqrt(3)

	for y := bounds.Min.Y; y < bounds.Max.Y; y++ {
		for x := bounds.Min.X; x < bounds.Max.X; x++ {
			r, g, b, _ := dst.At(x, y).RGBA()
			pr := uint8(r >> 8)
			pg := uint8(g >> 8)
			pb := uint8(b >> 8)

			dr := float64(int(pr) - int(refR))
			dg := float64(int(pg) - int(refG))
			db := float64(int(pb) - int(refB))
			dist := math.Sqrt(dr*dr + dg*dg + db*db)

			if dist <= maxDist {
				dst.SetNRGBA(x, y, bg)
			}
		}
	}

	outPath := output
	if outPath == "" {
		ext := filepath.Ext(inputPath)
		outPath = inputPath[:len(inputPath)-len(ext)] + "_background" + ext
	}

	if err := imaging.Save(dst, outPath); err != nil {
		return fmt.Errorf("save: %w", err)
	}

	if jsonOut {
		b, _ := json.Marshal(result{
			Status:    "ok",
			Input:     inputPath,
			Output:    outPath,
			Color:     bgColor,
			Threshold: bgThreshold,
		})
		fmt.Println(string(b))
	} else {
		fmt.Println(outPath)
	}
	return nil
}

func parseColor(s string) color.NRGBA {
	if len(s) == 7 && s[0] == '#' {
		r, _ := strconv.ParseUint(s[1:3], 16, 8)
		g, _ := strconv.ParseUint(s[3:5], 16, 8)
		b, _ := strconv.ParseUint(s[5:7], 16, 8)
		return color.NRGBA{R: uint8(r), G: uint8(g), B: uint8(b), A: 255}
	}
	switch strings.ToLower(s) {
	case "black":
		return color.NRGBA{0, 0, 0, 255}
	case "white":
		return color.NRGBA{255, 255, 255, 255}
	case "red":
		return color.NRGBA{255, 0, 0, 255}
	case "green":
		return color.NRGBA{0, 128, 0, 255}
	case "blue":
		return color.NRGBA{0, 0, 255, 255}
	case "yellow":
		return color.NRGBA{255, 255, 0, 255}
	case "cyan":
		return color.NRGBA{0, 255, 255, 255}
	case "magenta":
		return color.NRGBA{255, 0, 255, 255}
	default:
		return color.NRGBA{255, 255, 255, 255}
	}
}
