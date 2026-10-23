package text

import (
	"encoding/json"
	"fmt"
	"image"
	"image/color"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/disintegration/imaging"
	"golang.org/x/image/font"
	"golang.org/x/image/font/basicfont"
	"golang.org/x/image/math/fixed"
)

type result struct {
	Status string `json:"status"`
	Input  string `json:"input"`
	Output string `json:"output"`
	Text   string `json:"text"`
}

func runText(inputPath string, jsonOut bool) error {
	src, err := imaging.Open(inputPath)
	if err != nil {
		return fmt.Errorf("open: %w", err)
	}

	dst := imaging.Clone(src)

	col := parseColor(textColor)

	d := &font.Drawer{
		Dst:  dst,
		Src:  image.NewUniform(col),
		Face: basicfont.Face7x13,
		Dot:  fixed.Point26_6{X: fixed.I(textX), Y: fixed.I(textY + 13)},
	}
	d.DrawString(textContent)

	outPath := output
	if outPath == "" {
		ext := filepath.Ext(inputPath)
		outPath = inputPath[:len(inputPath)-len(ext)] + "_text" + ext
	}

	if err := imaging.Save(dst, outPath); err != nil {
		return fmt.Errorf("save: %w", err)
	}

	if jsonOut {
		b, _ := json.Marshal(result{
			Status: "ok",
			Input:  inputPath,
			Output: outPath,
			Text:   textContent,
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
