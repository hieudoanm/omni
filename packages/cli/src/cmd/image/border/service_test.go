package border

import (
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/image/testutil"
)

func TestRunBorder_NoInputArg(t *testing.T) {
	testutil.SetHomeTempDir(t)
	err := runBorder("", false)
	if err == nil {
		t.Error("expected error for empty path")
	}
}

func TestRunBorder_NonExistentInput(t *testing.T) {
	testutil.SetHomeTempDir(t)
	err := runBorder("/nonexistent/file.png", false)
	if err == nil {
		t.Error("expected error for non-existent file")
	}
}

func TestRunBorder_ValidPNG(t *testing.T) {
	inputPath := testutil.CreateTestPNG(t)
	testutil.SetHomeTempDir(t)
	err := runBorder(inputPath, false)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
}
