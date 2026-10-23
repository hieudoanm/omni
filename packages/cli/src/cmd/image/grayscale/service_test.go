package grayscale

import (
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/image/testutil"
)

func TestRunGrayscale_NoInputArg(t *testing.T) {
	testutil.SetHomeTempDir(t)
	err := runGrayscale("", false)
	if err == nil {
		t.Error("expected error for empty path")
	}
}

func TestRunGrayscale_NonExistentInput(t *testing.T) {
	testutil.SetHomeTempDir(t)
	err := runGrayscale("/nonexistent/file.png", false)
	if err == nil {
		t.Error("expected error for non-existent file")
	}
}

func TestRunGrayscale_ValidPNG(t *testing.T) {
	inputPath := testutil.CreateTestPNG(t)
	testutil.SetHomeTempDir(t)
	err := runGrayscale(inputPath, false)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
}
