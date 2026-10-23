package info

import (
	"encoding/json"
	"fmt"
	"image"
	_ "image/gif"
	_ "image/jpeg"
	_ "image/png"
	"os"
	"strings"
)

type metadata struct {
	Format string `json:"format"`
	Width  int    `json:"width"`
	Height int    `json:"height"`
	Size   int64  `json:"size_bytes"`
}

func runInfo(path string) error {
	f, err := os.Open(path)
	if err != nil {
		return fmt.Errorf("open: %w", err)
	}
	defer f.Close()

	img, format, err := image.Decode(f)
	if err != nil {
		return fmt.Errorf("decode: %w", err)
	}

	info, _ := os.Stat(path)

	meta := metadata{
		Format: strings.ToUpper(format),
		Width:  img.Bounds().Dx(),
		Height: img.Bounds().Dy(),
		Size:   info.Size(),
	}

	jsonOut, _ := json.Marshal(meta)
	fmt.Println(string(jsonOut))
	return nil
}
