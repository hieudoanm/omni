package pixelate

import (
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/image/testutil"
)

func TestRunPixelate_NoInputArg(t *testing.T) {
	testutil.SetHomeTempDir(t)
	err := runPixelate("", false)
	if err == nil {
		t.Error("expected error for empty path")
	}
}

func TestRunPixelate_NonExistentInput(t *testing.T) {
	testutil.SetHomeTempDir(t)
	err := runPixelate("/nonexistent/file.png", false)
	if err == nil {
		t.Error("expected error for non-existent file")
	}
}

func TestRunPixelate_ValidPNG(t *testing.T) {
	inputPath := testutil.CreateTestPNG(t)
	testutil.SetHomeTempDir(t)
	err := runPixelate(inputPath, false)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
}
