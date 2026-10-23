package compress

import (
	"fmt"
	"os/exec"
	"path/filepath"
	"strings"
)

var quality int
var output string

func runCompress(inputPath string) error {
	if _, err := exec.LookPath("ffmpeg"); err != nil {
		return fmt.Errorf("video compress: ffmpeg not found on PATH")
	}

	outPath := output
	if outPath == "" {
		ext := filepath.Ext(inputPath)
		base := strings.TrimSuffix(inputPath, ext)
		outPath = base + "_compressed.mp4"
	}

	args := []string{
		"-i", inputPath,
		"-crf", fmt.Sprintf("%d", quality),
		"-y", outPath,
	}
	cmd := exec.Command("ffmpeg", args...)
	if out, err := cmd.CombinedOutput(); err != nil {
		return fmt.Errorf("video compress: %w\n%s", err, string(out))
	}

	fmt.Printf("compressed %s -> %s\n", inputPath, outPath)
	return nil
}
