package crop

import (
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/image/testutil"
)

func TestRunCrop_NoInputArg(t *testing.T) {
	testutil.SetHomeTempDir(t)
	err := runCrop("", false)
	if err == nil {
		t.Error("expected error for empty path")
	}
}

func TestRunCrop_NonExistentInput(t *testing.T) {
	testutil.SetHomeTempDir(t)
	err := runCrop("/nonexistent/file.png", false)
	if err == nil {
		t.Error("expected error for non-existent file")
	}
}

func TestRunCrop_ValidPNG(t *testing.T) {
	inputPath := testutil.CreateTestPNG(t)
	testutil.SetHomeTempDir(t)
	err := runCrop(inputPath, false)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
}

func TestRunCrop_WithCenter(t *testing.T) {
	inputPath := testutil.CreateTestPNG(t)
	testutil.SetHomeTempDir(t)
	center = true
	cropW = 3
	cropH = 3
	defer func() { center = false; cropW = 0; cropH = 0 }()

	err := runCrop(inputPath, false)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
}
