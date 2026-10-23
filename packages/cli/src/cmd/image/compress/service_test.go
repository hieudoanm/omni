package compress

import (
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/image/testutil"
)

func TestRunCompress_NoInputArg(t *testing.T) {
	testutil.SetHomeTempDir(t)
	err := runCompress("", false)
	if err == nil {
		t.Error("expected error for empty path")
	}
}

func TestRunCompress_NonExistentInput(t *testing.T) {
	testutil.SetHomeTempDir(t)
	err := runCompress("/nonexistent/file.png", false)
	if err == nil {
		t.Error("expected error for non-existent file")
	}
}

func TestRunCompress_ValidPNG(t *testing.T) {
	inputPath := testutil.CreateTestPNG(t)
	testutil.SetHomeTempDir(t)
	err := runCompress(inputPath, false)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
}

func TestRunCompress_JPEGOutput(t *testing.T) {
	inputPath := testutil.CreateTestPNG(t)
	testutil.SetHomeTempDir(t)
	format = "jpg"
	defer func() { format = "" }()

	err := runCompress(inputPath, false)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
}
