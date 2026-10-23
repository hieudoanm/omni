package mute

import (
	"fmt"
	"os/exec"
	"path/filepath"
	"strings"
)

var output string

func runMute(inputPath string) error {
	if _, err := exec.LookPath("ffmpeg"); err != nil {
		return fmt.Errorf("video mute: ffmpeg not found on PATH")
	}

	outPath := output
	if outPath == "" {
		ext := filepath.Ext(inputPath)
		base := strings.TrimSuffix(inputPath, ext)
		outPath = base + "_muted.mp4"
	}

	args := []string{"-i", inputPath, "-an", "-y", outPath}
	cmd := exec.Command("ffmpeg", args...)
	if out, err := cmd.CombinedOutput(); err != nil {
		return fmt.Errorf("video mute: %w\n%s", err, string(out))
	}

	fmt.Printf("muted %s -> %s\n", inputPath, outPath)
	return nil
}
