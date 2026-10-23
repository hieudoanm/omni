package compress

import (
	"os/exec"
	"testing"
)

func TestRunCompress_missingFFmpeg(t *testing.T) {
	if _, err := exec.LookPath("ffmpeg"); err == nil {
		t.Skip("ffmpeg is available on PATH, skipping missing ffmpeg test")
	}
	err := runCompress("input.mp4")
	if err == nil {
		t.Fatal("expected error when ffmpeg is missing")
	}
}

func TestRunCompress_missingInput(t *testing.T) {
	if _, err := exec.LookPath("ffmpeg"); err != nil {
		t.Skip("ffmpeg not available, skipping")
	}
	quality = 23
	output = ""
	err := runCompress("/nonexistent/input.mp4")
	if err == nil {
		t.Fatal("expected error for missing input file")
	}
}
