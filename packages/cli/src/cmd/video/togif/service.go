package togif

import (
	"fmt"
	"os/exec"
	"path/filepath"
	"strings"
)

var fps, width int
var output string

func runToGif(inputPath string) error {
	if _, err := exec.LookPath("ffmpeg"); err != nil {
		return fmt.Errorf("video to-gif: ffmpeg not found on PATH")
	}

	outPath := output
	if outPath == "" {
		ext := filepath.Ext(inputPath)
		base := strings.TrimSuffix(inputPath, ext)
		outPath = base + ".gif"
	}

	vf := fmt.Sprintf("fps=%d,scale=%d:-1:flags=lanczos", fps, width)
	args := []string{
		"-i", inputPath,
		"-vf", vf,
		"-y", outPath,
	}
	cmd := exec.Command("ffmpeg", args...)
	if out, err := cmd.CombinedOutput(); err != nil {
		return fmt.Errorf("video to-gif: %w\n%s", err, string(out))
	}

	fmt.Printf("converted %s -> %s\n", inputPath, outPath)
	return nil
}
