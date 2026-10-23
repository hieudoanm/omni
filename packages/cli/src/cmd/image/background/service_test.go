package background

import (
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/image/testutil"
)

func TestRunBackground_NoInputArg(t *testing.T) {
	testutil.SetHomeTempDir(t)
	err := runBackground("", false)
	if err == nil {
		t.Error("expected error for empty path")
	}
}

func TestRunBackground_NonExistentInput(t *testing.T) {
	testutil.SetHomeTempDir(t)
	err := runBackground("/nonexistent/file.png", false)
	if err == nil {
		t.Error("expected error for non-existent file")
	}
}

func TestRunBackground_ValidPNG(t *testing.T) {
	inputPath := testutil.CreateTestPNG(t)
	testutil.SetHomeTempDir(t)
	err := runBackground(inputPath, false)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
}
