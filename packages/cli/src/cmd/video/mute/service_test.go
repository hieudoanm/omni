package mute

import (
	"os/exec"
	"testing"
)

func TestRunMute_missingFFmpeg(t *testing.T) {
	if _, err := exec.LookPath("ffmpeg"); err == nil {
		t.Skip("ffmpeg is available on PATH, skipping missing ffmpeg test")
	}
	err := runMute("input.mp4")
	if err == nil {
		t.Fatal("expected error when ffmpeg is missing")
	}
}

func TestRunMute_missingInput(t *testing.T) {
	if _, err := exec.LookPath("ffmpeg"); err != nil {
		t.Skip("ffmpeg not available, skipping")
	}
	output = ""
	err := runMute("/nonexistent/input.mp4")
	if err == nil {
		t.Fatal("expected error for missing input file")
	}
}
