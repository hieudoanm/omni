package border

import (
	"encoding/json"
	"fmt"
	"image"
	"image/color"
	"image/draw"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/disintegration/imaging"
)

type result struct {
	Status string `json:"status"`
	Input  string `json:"input"`
	Output string `json:"output"`
	Width  int    `json:"width"`
	Color  string `json:"color"`
}

func runBorder(inputPath string, jsonOut bool) error {
	src, err := imaging.Open(inputPath)
	if err != nil {
		return fmt.Errorf("open: %w", err)
	}

	bounds := src.Bounds()
	w := bounds.Dx() + 2*borderWidth
	h := bounds.Dy() + 2*borderWidth

	dst := image.NewNRGBA(image.Rect(0, 0, w, h))
	bgColor := parseColor(borderColor)
	draw.Draw(dst, dst.Bounds(), &image.Uniform{bgColor}, image.Point{}, draw.Src)
	draw.Draw(dst, image.Rect(borderWidth, borderWidth, borderWidth+bounds.Dx(), borderWidth+bounds.Dy()), src, bounds.Min, draw.Src)

	outPath := output
	if outPath == "" {
		ext := filepath.Ext(inputPath)
		outPath = inputPath[:len(inputPath)-len(ext)] + "_bordered" + ext
	}

	if err := imaging.Save(dst, outPath); err != nil {
		return fmt.Errorf("save: %w", err)
	}

	if jsonOut {
		b, _ := json.Marshal(result{
			Status: "ok",
			Input:  inputPath,
			Output: outPath,
			Width:  borderWidth,
			Color:  borderColor,
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
		return color.NRGBA{0, 0, 0, 255}
	}
}
