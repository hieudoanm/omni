package subtitles

import (
	"fmt"
	"os/exec"
	"path/filepath"
	"strings"
)

var action, lang, output string

func runSubtitles(inputPath string) error {
	if _, err := exec.LookPath("ffmpeg"); err != nil {
		return fmt.Errorf("video subtitles: ffmpeg not found on PATH")
	}

	outPath := output
	if outPath == "" {
		ext := filepath.Ext(inputPath)
		base := strings.TrimSuffix(inputPath, ext)
		if action == "burn" {
			outPath = base + "_subbed.mp4"
		} else {
			outPath = base + "_subtitles.srt"
		}
	}

	var args []string
	switch action {
	case "extract":
		args = []string{"-i", inputPath, "-map", "0:s:0", "-y", outPath}
	case "burn":
		subFile := outPath
		ext := filepath.Ext(inputPath)
		base := strings.TrimSuffix(inputPath, ext)
		if output == "" {
			subFile = base + "_subtitles.srt"
		}
		args = []string{"-i", inputPath, "-vf", fmt.Sprintf("subtitles=%s", subFile), "-y", outPath}
	default:
		return fmt.Errorf("video subtitles: unknown action %q, use 'extract' or 'burn'", action)
	}

	cmd := exec.Command("ffmpeg", args...)
	if out, err := cmd.CombinedOutput(); err != nil {
		return fmt.Errorf("video subtitles: %w\n%s", err, string(out))
	}

	fmt.Printf("subtitles %s -> %s\n", inputPath, outPath)
	return nil
}
