package text

import (
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/image/testutil"
)

func TestRunText_NoInputArg(t *testing.T) {
	testutil.SetHomeTempDir(t)
	err := runText("", false)
	if err == nil {
		t.Error("expected error for empty path")
	}
}

func TestRunText_NonExistentInput(t *testing.T) {
	testutil.SetHomeTempDir(t)
	err := runText("/nonexistent/file.png", false)
	if err == nil {
		t.Error("expected error for non-existent file")
	}
}

func TestRunText_ValidPNG(t *testing.T) {
	inputPath := testutil.CreateTestPNG(t)
	testutil.SetHomeTempDir(t)
	textContent = "hello"
	defer func() { textContent = "" }()

	err := runText(inputPath, false)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
}
