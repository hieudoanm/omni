package dominant

import (
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/image/testutil"
)

func TestRunDominant_NoInputArg(t *testing.T) {
	testutil.SetHomeTempDir(t)
	err := runDominant("", 5)
	if err == nil {
		t.Error("expected error for empty path")
	}
}

func TestRunDominant_NonExistentInput(t *testing.T) {
	testutil.SetHomeTempDir(t)
	err := runDominant("/nonexistent/file.png", 5)
	if err == nil {
		t.Error("expected error for non-existent file")
	}
}

func TestRunDominant_ValidPNG(t *testing.T) {
	inputPath := testutil.CreateTestPNG(t)
	testutil.SetHomeTempDir(t)
	err := runDominant(inputPath, 5)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
}
