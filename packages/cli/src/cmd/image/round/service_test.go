package round

import (
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/image/testutil"
)

func TestRunRound_NoInputArg(t *testing.T) {
	testutil.SetHomeTempDir(t)
	err := runRound("", false)
	if err == nil {
		t.Error("expected error for empty path")
	}
}

func TestRunRound_NonExistentInput(t *testing.T) {
	testutil.SetHomeTempDir(t)
	err := runRound("/nonexistent/file.png", false)
	if err == nil {
		t.Error("expected error for non-existent file")
	}
}

func TestRunRound_ValidPNG(t *testing.T) {
	inputPath := testutil.CreateTestPNG(t)
	testutil.SetHomeTempDir(t)
	err := runRound(inputPath, false)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
}
