package resize

import (
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/image/testutil"
)

func TestRunResize_NoInputArg(t *testing.T) {
	testutil.SetHomeTempDir(t)
	err := runResize("", false)
	if err == nil {
		t.Error("expected error for empty path")
	}
}

func TestRunResize_NonExistentInput(t *testing.T) {
	testutil.SetHomeTempDir(t)
	err := runResize("/nonexistent/file.png", false)
	if err == nil {
		t.Error("expected error for non-existent file")
	}
}

func TestRunResize_ValidPNG(t *testing.T) {
	inputPath := testutil.CreateTestPNG(t)
	testutil.SetHomeTempDir(t)
	err := runResize(inputPath, false)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
}

func TestRunResize_WithCustomOutput(t *testing.T) {
	inputPath := testutil.CreateTestPNG(t)
	testutil.SetHomeTempDir(t)
	output = inputPath + ".out.png"
	defer func() { output = "" }()
	width = 10
	height = 10
	defer func() { width, height = 0, 0 }()

	err := runResize(inputPath, false)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
}
