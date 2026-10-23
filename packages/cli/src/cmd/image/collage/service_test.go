package collage

import (
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/image/testutil"
)

func TestRunCollage_NoInputArg(t *testing.T) {
	testutil.SetHomeTempDir(t)
	err := runCollage([]string{}, false)
	if err == nil {
		t.Error("expected error for empty args")
	}
}

func TestRunCollage_NonExistentInput(t *testing.T) {
	testutil.SetHomeTempDir(t)
	err := runCollage([]string{"/nonexistent/file.png", "/nonexistent/file2.png"}, false)
	if err == nil {
		t.Error("expected error for non-existent file")
	}
}

func TestRunCollage_ValidPNG(t *testing.T) {
	inputPath1 := testutil.CreateTestPNG(t)
	inputPath2 := testutil.CreateTestPNG(t)
	testutil.SetHomeTempDir(t)
	err := runCollage([]string{inputPath1, inputPath2}, false)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
}
