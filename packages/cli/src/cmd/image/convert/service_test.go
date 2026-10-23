package convert

import (
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/image/testutil"
)

func TestRemoveExt(t *testing.T) {
	tests := []struct {
		input string
		want  string
	}{
		{"/path/to/image.png", "/path/to/image"},
		{"image.jpg", "image"},
		{"noext", "noext"},
		{"/a/b/c.tar.gz", "/a/b/c.tar"},
	}
	for _, tt := range tests {
		got := removeExt(tt.input)
		if got != tt.want {
			t.Errorf("removeExt(%q) = %q, want %q", tt.input, got, tt.want)
		}
	}
}

func TestRunConvert_NoInputArg(t *testing.T) {
	testutil.SetHomeTempDir(t)
	err := runConvert("")
	if err == nil {
		t.Error("expected error for empty path")
	}
}

func TestRunConvert_NonExistentInput(t *testing.T) {
	testutil.SetHomeTempDir(t)
	err := runConvert("/nonexistent/file.png")
	if err == nil {
		t.Error("expected error for non-existent file")
	}
}

func TestRunConvert_ValidPNG(t *testing.T) {
	inputPath := testutil.CreateTestPNG(t)
	testutil.SetHomeTempDir(t)
	err := runConvert(inputPath)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
}

func TestRunConvert_JPEGOutput(t *testing.T) {
	inputPath := testutil.CreateTestPNG(t)
	testutil.SetHomeTempDir(t)
	outputFormat = "jpg"
	defer func() { outputFormat = "" }()

	err := runConvert(inputPath)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
}

func TestRunConvert_GIFOutput(t *testing.T) {
	inputPath := testutil.CreateTestPNG(t)
	testutil.SetHomeTempDir(t)
	outputFormat = "gif"
	defer func() { outputFormat = "" }()

	err := runConvert(inputPath)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
}

func TestRunConvert_UnsupportedFormat(t *testing.T) {
	inputPath := testutil.CreateTestPNG(t)
	testutil.SetHomeTempDir(t)
	outputFormat = "bmp"
	defer func() { outputFormat = "" }()

	err := runConvert(inputPath)
	if err == nil {
		t.Fatal("expected error for unsupported format")
	}
}

func TestRunConvert_WithCustomOutput(t *testing.T) {
	inputPath := testutil.CreateTestPNG(t)
	testutil.SetHomeTempDir(t)
	output = inputPath + ".out.jpg"
	defer func() { output = "" }()

	err := runConvert(inputPath)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
}
