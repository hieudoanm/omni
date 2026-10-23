package until

import (
	"bytes"
	"io"
	"os"
	"strings"
	"testing"
	"time"
)

func captureOutput(fn func()) string {
	old := os.Stdout
	r, w, _ := os.Pipe()
	os.Stdout = w
	fn()
	w.Close()
	var buf bytes.Buffer
	io.Copy(&buf, r)
	os.Stdout = old
	return buf.String()
}

func TestPrintCountdown(t *testing.T) {
	target := time.Now().Add(365 * 24 * time.Hour)
	output := captureOutput(func() {
		if err := printCountdown(target); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "d") {
		t.Errorf("expected countdown output, got: %s", output)
	}
}

func TestPrintCountdown_PastTime(t *testing.T) {
	target := time.Date(2020, 1, 1, 0, 0, 0, 0, time.Local)
	output := captureOutput(func() {
		if err := printCountdown(target); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "already passed") {
		t.Errorf("expected 'already passed' message, got: %s", output)
	}
}
