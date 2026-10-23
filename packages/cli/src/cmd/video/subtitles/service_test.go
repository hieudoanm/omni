package subtitles

import (
	"os/exec"
	"testing"
)

func TestRunSubtitles_missingFFmpeg(t *testing.T) {
	if _, err := exec.LookPath("ffmpeg"); err == nil {
		t.Skip("ffmpeg is available on PATH, skipping missing ffmpeg test")
	}
	err := runSubtitles("input.mp4")
	if err == nil {
		t.Fatal("expected error when ffmpeg is missing")
	}
}

func TestRunSubtitles_missingInput(t *testing.T) {
	if _, err := exec.LookPath("ffmpeg"); err != nil {
		t.Skip("ffmpeg not available, skipping")
	}
	action = "extract"
	lang = "eng"
	output = ""
	err := runSubtitles("/nonexistent/input.mp4")
	if err == nil {
		t.Fatal("expected error for missing input file")
	}
}

func TestRunSubtitles_unknownAction(t *testing.T) {
	if _, err := exec.LookPath("ffmpeg"); err != nil {
		t.Skip("ffmpeg not available, skipping")
	}
	action = "invalid"
	lang = "eng"
	output = ""
	err := runSubtitles("input.mp4")
	if err == nil {
		t.Fatal("expected error for unknown action")
	}
}
