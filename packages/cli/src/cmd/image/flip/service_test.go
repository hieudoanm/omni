package flip

import (
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/image/testutil"
)

func TestRunFlip_NoInputArg(t *testing.T) {
	testutil.SetHomeTempDir(t)
	err := runFlip("", false)
	if err == nil {
		t.Error("expected error for empty path")
	}
}

func TestRunFlip_NonExistentInput(t *testing.T) {
	testutil.SetHomeTempDir(t)
	err := runFlip("/nonexistent/file.png", false)
	if err == nil {
		t.Error("expected error for non-existent file")
	}
}

func TestRunFlip_ValidPNG(t *testing.T) {
	inputPath := testutil.CreateTestPNG(t)
	testutil.SetHomeTempDir(t)
	err := runFlip(inputPath, false)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
}

func TestRunFlip_Vertical(t *testing.T) {
	inputPath := testutil.CreateTestPNG(t)
	testutil.SetHomeTempDir(t)
	vertical = true
	defer func() { vertical = false }()

	err := runFlip(inputPath, false)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
}
