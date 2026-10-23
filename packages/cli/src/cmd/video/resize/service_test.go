package resize

import (
	"os/exec"
	"testing"
)

func TestRunResize_missingFFmpeg(t *testing.T) {
	if _, err := exec.LookPath("ffmpeg"); err == nil {
		t.Skip("ffmpeg is available on PATH, skipping missing ffmpeg test")
	}
	err := runResize("input.mp4")
	if err == nil {
		t.Fatal("expected error when ffmpeg is missing")
	}
}

func TestRunResize_missingInput(t *testing.T) {
	if _, err := exec.LookPath("ffmpeg"); err != nil {
		t.Skip("ffmpeg not available, skipping")
	}
	width = -1
	height = 720
	output = ""
	err := runResize("/nonexistent/input.mp4")
	if err == nil {
		t.Fatal("expected error for missing input file")
	}
}
