package resize

import (
	"fmt"
	"os/exec"
	"path/filepath"
	"strings"
)

var width, height int
var output string

func runResize(inputPath string) error {
	if _, err := exec.LookPath("ffmpeg"); err != nil {
		return fmt.Errorf("video resize: ffmpeg not found on PATH")
	}

	outPath := output
	if outPath == "" {
		ext := filepath.Ext(inputPath)
		base := strings.TrimSuffix(inputPath, ext)
		outPath = base + "_resized.mp4"
	}

	w := width
	h := height
	if w < 0 {
		w = -1
	}
	if h < 0 {
		h = -1
	}
	scale := fmt.Sprintf("scale=%d:%d", w, h)
	args := []string{"-i", inputPath, "-vf", scale, "-y", outPath}
	cmd := exec.Command("ffmpeg", args...)
	if out, err := cmd.CombinedOutput(); err != nil {
		return fmt.Errorf("video resize: %w\n%s", err, string(out))
	}

	fmt.Printf("resized %s -> %s\n", inputPath, outPath)
	return nil
}
