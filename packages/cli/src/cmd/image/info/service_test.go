package info

import (
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/image/testutil"
)

func TestRunInfo_NoInputArg(t *testing.T) {
	testutil.SetHomeTempDir(t)
	err := runInfo("")
	if err == nil {
		t.Error("expected error for empty path")
	}
}

func TestRunInfo_NonExistentInput(t *testing.T) {
	testutil.SetHomeTempDir(t)
	err := runInfo("/nonexistent/file.png")
	if err == nil {
		t.Error("expected error for non-existent file")
	}
}

func TestRunInfo_ValidPNG(t *testing.T) {
	inputPath := testutil.CreateTestPNG(t)
	testutil.SetHomeTempDir(t)
	err := runInfo(inputPath)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
}
