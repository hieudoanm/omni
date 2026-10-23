package sharpen

import (
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/image/testutil"
)

func TestRunSharpen_NoInputArg(t *testing.T) {
	testutil.SetHomeTempDir(t)
	err := runSharpen("", false)
	if err == nil {
		t.Error("expected error for empty path")
	}
}

func TestRunSharpen_NonExistentInput(t *testing.T) {
	testutil.SetHomeTempDir(t)
	err := runSharpen("/nonexistent/file.png", false)
	if err == nil {
		t.Error("expected error for non-existent file")
	}
}

func TestRunSharpen_ValidPNG(t *testing.T) {
	inputPath := testutil.CreateTestPNG(t)
	testutil.SetHomeTempDir(t)
	err := runSharpen(inputPath, false)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
}
