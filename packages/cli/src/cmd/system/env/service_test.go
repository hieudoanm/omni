package env

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

func TestEnvRun_Filter(t *testing.T) {
	out := captureOutput(func() {
		err := envRun("PATH", false, false)
		if err != nil {
			t.Errorf("unexpected error: %v", err)
		}
	})
	if !strings.Contains(out, "PATH=") {
		t.Errorf("expected PATH=..., got %q", out)
	}
}

func TestEnvRun_JSON(t *testing.T) {
	out := captureOutput(func() {
		err := envRun("", false, true)
		if err != nil {
			t.Errorf("unexpected error: %v", err)
		}
	})
	if !strings.Contains(out, `"key"`) {
		t.Errorf("expected JSON output, got %q", out)
	}
}

func TestEnvRun_Sort(t *testing.T) {
	out := captureOutput(func() {
		err := envRun("", true, false)
		if err != nil {
			t.Errorf("unexpected error: %v", err)
		}
	})
	if !strings.Contains(out, "=") {
		t.Errorf("expected env output, got %q", out)
	}
}
