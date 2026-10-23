package split

import (
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/image/testutil"
)

func TestRunSplit_NoInputArg(t *testing.T) {
	testutil.SetHomeTempDir(t)
	err := runSplit("", false)
	if err == nil {
		t.Error("expected error for empty path")
	}
}

func TestRunSplit_NonExistentInput(t *testing.T) {
	testutil.SetHomeTempDir(t)
	err := runSplit("/nonexistent/file.png", false)
	if err == nil {
		t.Error("expected error for non-existent file")
	}
}

func TestRunSplit_ValidPNG(t *testing.T) {
	inputPath := testutil.CreateTestPNG(t)
	testutil.SetHomeTempDir(t)
	splitRows = 1
	splitCols = 1
	defer func() { splitRows = 2; splitCols = 2 }()

	err := runSplit(inputPath, false)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
}
