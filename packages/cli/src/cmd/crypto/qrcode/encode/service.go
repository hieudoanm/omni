package encode

import (
	"encoding/json"
	"fmt"
	"image"
	"image/color"
	"image/png"
	"os"
	"strings"

	"github.com/mdp/qrterminal/v4"
	"rsc.io/qr"
)

func runQRCode(data string, jsonOutput bool, inputFile, outputFile string, levelStr string, quietZone int, invert bool) error {
	if inputFile != "" {
		b, err := os.ReadFile(inputFile)
		if err != nil {
			return fmt.Errorf("reading input file: %w", err)
		}
		data = strings.TrimSpace(string(b))
	}

	if data == "" {
		return fmt.Errorf("no data provided; use --data, --input, or pass text as an argument")
	}

	if jsonOutput {
		b, _ := json.MarshalIndent(map[string]any{
			"data": data,
		}, "", "  ")
		fmt.Println(string(b))
		return nil
	}

	ecLevel := parseLevel(levelStr)

	if outputFile != "" {
		return writePNG(data, ecLevel, outputFile, quietZone, invert)
	}

	config := qrterminal.Config{
		Level:      ecLevel,
		Writer:     os.Stdout,
		HalfBlocks: true,
		BlackChar:  qrterminal.BLACK,
		WhiteChar:  qrterminal.WHITE,
		QuietZone:  quietZone,
	}
	if invert {
		config.BlackChar = qrterminal.WHITE
		config.WhiteChar = qrterminal.BLACK
		config.BlackWhiteChar = qrterminal.WHITE_BLACK
		config.WhiteBlackChar = qrterminal.BLACK_WHITE
	}
	qrterminal.GenerateWithConfig(data, config)
	fmt.Println()
	return nil
}

func parseLevel(s string) qr.Level {
	switch strings.ToUpper(s) {
	case "L":
		return qr.L
	case "M":
		return qr.M
	case "Q":
		return qr.Q
	case "H":
		return qr.H
	default:
		return qr.M
	}
}

func writePNG(data string, ecLevel qr.Level, path string, quietZone int, invert bool) error {
	code, err := qr.Encode(data, ecLevel)
	if err != nil {
		return fmt.Errorf("encoding QR code: %w", err)
	}

	size := code.Size + 2*quietZone
	img := image.NewGray(image.Rect(0, 0, size, size))

	for y := 0; y < size; y++ {
		for x := 0; x < size; x++ {
			black := false
			qx := x - quietZone
			qy := y - quietZone
			if qx >= 0 && qx < code.Size && qy >= 0 && qy < code.Size {
				black = code.Black(qx, qy)
			}
			if invert {
				black = !black
			}
			if black {
				img.Set(x, y, color.Gray{Y: 0})
			} else {
				img.Set(x, y, color.Gray{Y: 255})
			}
		}
	}

	f, err := os.Create(path)
	if err != nil {
		return fmt.Errorf("creating output file: %w", err)
	}
	defer f.Close()

	if err := png.Encode(f, img); err != nil {
		return fmt.Errorf("encoding PNG: %w", err)
	}
	return nil
}
