package trim

import (
	"fmt"
	"os/exec"
	"path/filepath"
	"strings"
)

var start, duration, to, output string

func runTrim(inputPath string) error {
	if _, err := exec.LookPath("ffmpeg"); err != nil {
		return fmt.Errorf("video trim: ffmpeg not found on PATH")
	}

	outPath := output
	if outPath == "" {
		ext := filepath.Ext(inputPath)
		base := strings.TrimSuffix(inputPath, ext)
		outPath = base + "_trimmed.mp4"
	}

	args := []string{"-i", inputPath, "-ss", start}
	if duration != "" {
		args = append(args, "-t", duration)
	} else if to != "" {
		args = append(args, "-to", to)
	}
	args = append(args, "-y", outPath)

	cmd := exec.Command("ffmpeg", args...)
	if out, err := cmd.CombinedOutput(); err != nil {
		return fmt.Errorf("video trim: %w\n%s", err, string(out))
	}

	fmt.Printf("trimmed %s -> %s\n", inputPath, outPath)
	return nil
}
