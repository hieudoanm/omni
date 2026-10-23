package path

import (
	"io"
	"os"
	"strings"
	"testing"
)

func captureOutput(fn func()) string {
	r, w, _ := os.Pipe()
	orig := os.Stdout
	os.Stdout = w
	fn()
	w.Close()
	out, _ := io.ReadAll(r)
	os.Stdout = orig
	return string(out)
}

func TestPathRun_OutputContainsPath(t *testing.T) {
	out := captureOutput(func() {
		err := pathRun(nil, "", false, false)
		if err != nil {
			t.Errorf("unexpected error: %v", err)
		}
	})
	if !strings.Contains(out, "/") {
		t.Errorf("expected path entries, got %q", out)
	}
}

func TestPathRun_JSONOutput(t *testing.T) {
	out := captureOutput(func() {
		err := pathRun(nil, "/usr", false, true)
		if err != nil {
			t.Errorf("unexpected error: %v", err)
		}
	})
	if !strings.Contains(out, `"dir"`) {
		t.Errorf("expected JSON with 'dir' field, got %q", out)
	}
}
