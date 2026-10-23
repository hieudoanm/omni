package trim

import (
	"os/exec"
	"testing"
)

func TestRunTrim_missingFFmpeg(t *testing.T) {
	if _, err := exec.LookPath("ffmpeg"); err == nil {
		t.Skip("ffmpeg is available on PATH, skipping missing ffmpeg test")
	}
	err := runTrim("input.mp4")
	if err == nil {
		t.Fatal("expected error when ffmpeg is missing")
	}
}

func TestRunTrim_missingInput(t *testing.T) {
	if _, err := exec.LookPath("ffmpeg"); err != nil {
		t.Skip("ffmpeg not available, skipping")
	}
	start = "00:00:00"
	duration = "00:00:10"
	to = ""
	output = ""
	err := runTrim("/nonexistent/input.mp4")
	if err == nil {
		t.Fatal("expected error for missing input file")
	}
}
