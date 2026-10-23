package icons

import (
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/image/testutil"
)

func TestRunIcons_NoInputArg(t *testing.T) {
	testutil.SetHomeTempDir(t)
	err := runIcons("")
	if err == nil {
		t.Error("expected error for empty path")
	}
}

func TestRunIcons_NonExistentInput(t *testing.T) {
	testutil.SetHomeTempDir(t)
	err := runIcons("/nonexistent/file.png")
	if err == nil {
		t.Error("expected error for non-existent file")
	}
}

func TestRunIcons_ValidPNG(t *testing.T) {
	inputPath := testutil.CreateTestPNG(t)
	testutil.SetHomeTempDir(t)
	err := runIcons(inputPath)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
}
