package extractaudio

import (
	"fmt"
	"os/exec"
	"path/filepath"
	"strings"
)

var audioFormat, output string

func runExtractAudio(inputPath string) error {
	if _, err := exec.LookPath("ffmpeg"); err != nil {
		return fmt.Errorf("video extract-audio: ffmpeg not found on PATH")
	}

	outFmt := audioFormat
	if outFmt == "" {
		outFmt = "mp3"
	}

	outPath := output
	if outPath == "" {
		ext := filepath.Ext(inputPath)
		base := strings.TrimSuffix(inputPath, ext)
		outPath = base + "_audio." + outFmt
	}

	codec := codecForFormat(outFmt)
	args := []string{"-i", inputPath, "-vn"}
	if codec != "" {
		args = append(args, "-acodec", codec)
	}
	args = append(args, "-y", outPath)

	cmd := exec.Command("ffmpeg", args...)
	if out, err := cmd.CombinedOutput(); err != nil {
		return fmt.Errorf("video extract-audio: %w\n%s", err, string(out))
	}

	fmt.Printf("extracted audio %s -> %s\n", inputPath, outPath)
	return nil
}

func codecForFormat(fmt string) string {
	switch fmt {
	case "mp3":
		return "libmp3lame"
	case "wav":
		return "pcm_s16le"
	case "flac":
		return "flac"
	case "ogg":
		return "libvorbis"
	case "m4a":
		return "aac"
	default:
		return ""
	}
}
