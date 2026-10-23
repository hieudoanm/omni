package tomp3

import (
	"fmt"
	"os/exec"
	"path/filepath"
	"strings"
)

var quality int
var output string

func runToMp3(inputPath string) error {
	if _, err := exec.LookPath("ffmpeg"); err != nil {
		return fmt.Errorf("video to-mp3: ffmpeg not found on PATH")
	}

	outPath := output
	if outPath == "" {
		ext := filepath.Ext(inputPath)
		base := strings.TrimSuffix(inputPath, ext)
		outPath = base + ".mp3"
	}

	args := []string{
		"-i", inputPath,
		"-vn",
		"-acodec", "libmp3lame",
		"-aq", fmt.Sprintf("%d", quality),
		"-y", outPath,
	}
	cmd := exec.Command("ffmpeg", args...)
	if out, err := cmd.CombinedOutput(); err != nil {
		return fmt.Errorf("video to-mp3: %w\n%s", err, string(out))
	}

	fmt.Printf("converted %s -> %s\n", inputPath, outPath)
	return nil
}
