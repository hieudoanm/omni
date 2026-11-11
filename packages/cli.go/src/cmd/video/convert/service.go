package convert

import (
	"fmt"
	"os/exec"
	"path/filepath"
	"strings"
)

var outputFormat, output string

func runConvert(inputPath string) error {
	if _, err := exec.LookPath("ffmpeg"); err != nil {
		return fmt.Errorf("video convert: ffmpeg not found on PATH")
	}

	outFmt := outputFormat
	if outFmt == "" {
		outFmt = "mp4"
	}

	outPath := output
	if outPath == "" {
		ext := filepath.Ext(inputPath)
		base := strings.TrimSuffix(inputPath, ext)
		outPath = base + "." + outFmt
	}

	args := []string{"-i", inputPath, "-y", outPath}
	cmd := exec.Command("ffmpeg", args...)
	if out, err := cmd.CombinedOutput(); err != nil {
		return fmt.Errorf("video convert: %w\n%s", err, string(out))
	}

	fmt.Printf("converted %s -> %s\n", inputPath, outPath)
	return nil
}
