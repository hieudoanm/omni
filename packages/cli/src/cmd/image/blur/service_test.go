package blur

import (
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/image/testutil"
)

func TestRunBlur_NoInputArg(t *testing.T) {
	testutil.SetHomeTempDir(t)
	err := runBlur("", false)
	if err == nil {
		t.Error("expected error for empty path")
	}
}

func TestRunBlur_NonExistentInput(t *testing.T) {
	testutil.SetHomeTempDir(t)
	err := runBlur("/nonexistent/file.png", false)
	if err == nil {
		t.Error("expected error for non-existent file")
	}
}

func TestRunBlur_ValidPNG(t *testing.T) {
	inputPath := testutil.CreateTestPNG(t)
	testutil.SetHomeTempDir(t)
	err := runBlur(inputPath, false)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
}
