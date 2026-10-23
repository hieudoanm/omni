package disk

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

func TestNewCmd_RunE_Basic(t *testing.T) {
	cmd := NewCmd()
	output := captureOutput(func() {
		if err := cmd.RunE(cmd, nil); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "Filesystem") {
		t.Errorf("expected 'Filesystem' header in output, got %q", output)
	}
}

func TestNewCmd_RunE_Sort(t *testing.T) {
	cmd := NewCmd()
	if err := cmd.Flags().Set("sort", "true"); err != nil {
		t.Fatal(err)
	}
	output := captureOutput(func() {
		if err := cmd.RunE(cmd, nil); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "Filesystem") {
		t.Errorf("expected 'Filesystem' header in output, got %q", output)
	}
}

func TestNewCmd_RunE_JSON(t *testing.T) {
	cmd := NewCmd()
	if err := cmd.Flags().Set("json", "true"); err != nil {
		t.Fatal(err)
	}
	output := captureOutput(func() {
		if err := cmd.RunE(cmd, nil); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, `"mount"`) {
		t.Errorf("expected JSON with mount field, got %q", output)
	}
}
