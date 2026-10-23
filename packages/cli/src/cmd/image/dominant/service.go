package dominant

import (
	"encoding/json"
	"fmt"
	"image"
	"image/color"
	_ "image/gif"
	_ "image/jpeg"
	_ "image/png"
	"os"
	"sort"
)

type colorCount struct {
	R, G, B, A uint32
	Count      int
}

type dominantColor struct {
	Hex string  `json:"hex"`
	R   int     `json:"r"`
	G   int     `json:"g"`
	B   int     `json:"b"`
	Pct float64 `json:"pct"`
}

func runDominant(path string, topN int) error {
	f, err := os.Open(path)
	if err != nil {
		return fmt.Errorf("open: %w", err)
	}
	defer f.Close()

	img, _, err := image.Decode(f)
	if err != nil {
		return fmt.Errorf("decode: %w", err)
	}

	bounds := img.Bounds()
	pixelCount := bounds.Dx() * bounds.Dy()
	colorMap := make(map[color.RGBA]int)

	for y := bounds.Min.Y; y < bounds.Max.Y; y++ {
		for x := bounds.Min.X; x < bounds.Max.X; x++ {
			r, g, b, a := img.At(x, y).RGBA()
			c := color.RGBA{
				R: uint8(r >> 8),
				G: uint8(g >> 8),
				B: uint8(b >> 8),
				A: uint8(a >> 8),
			}
			colorMap[c]++
		}
	}

	var sorted []colorCount
	for c, count := range colorMap {
		r, g, b, a := c.RGBA()
		sorted = append(sorted, colorCount{R: r, G: g, B: b, A: a, Count: count})
	}
	sort.Slice(sorted, func(i, j int) bool {
		return sorted[i].Count > sorted[j].Count
	})

	if topN > len(sorted) {
		topN = len(sorted)
	}
	sorted = sorted[:topN]

	colors := make([]dominantColor, topN)
	for i, cc := range sorted {
		r8 := uint8(cc.R >> 8)
		g8 := uint8(cc.G >> 8)
		b8 := uint8(cc.B >> 8)
		colors[i] = dominantColor{
			Hex: fmt.Sprintf("#%02x%02x%02x", r8, g8, b8),
			R:   int(r8),
			G:   int(g8),
			B:   int(b8),
			Pct: float64(cc.Count) / float64(pixelCount) * 100,
		}
	}

	jsonOut, _ := json.Marshal(colors)
	fmt.Println(string(jsonOut))
	return nil
}
