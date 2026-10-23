package convert

import (
	"os/exec"
	"testing"
)

func TestRunConvert_missingFFmpeg(t *testing.T) {
	if _, err := exec.LookPath("ffmpeg"); err == nil {
		t.Skip("ffmpeg is available on PATH, skipping missing ffmpeg test")
	}
	err := runConvert("input.mp4")
	if err == nil {
		t.Fatal("expected error when ffmpeg is missing")
	}
}

func TestRunConvert_missingInput(t *testing.T) {
	if _, err := exec.LookPath("ffmpeg"); err != nil {
		t.Skip("ffmpeg not available, skipping")
	}
	outputFormat = "mp4"
	output = ""
	err := runConvert("/nonexistent/input.mp4")
	if err == nil {
		t.Fatal("expected error for missing input file")
	}
}
