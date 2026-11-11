package stopwatch

import (
	"bytes"
	"context"
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

func TestRunStopwatch(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Millisecond)
	defer cancel()
	output := captureOutput(func() {
		if err := runStopwatch(ctx, false); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "Elapsed:") {
		t.Errorf("expected elapsed time, got: %s", output)
	}
}

func TestRunStopwatch_JSON(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Millisecond)
	defer cancel()
	output := captureOutput(func() {
		if err := runStopwatch(ctx, true); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "elapsed") {
		t.Errorf("expected JSON elapsed field, got: %s", output)
	}
}

func TestFormatDuration(t *testing.T) {
	got := formatDuration(3661 * time.Second)
	if got != "01:01:01" {
		t.Errorf("expected '01:01:01', got %q", got)
	}
}
