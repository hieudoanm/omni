package random

import (
	"bytes"
	"io"
	"os"
	"strings"
	"testing"
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

func TestRunRandom(t *testing.T) {
	output := captureOutput(func() {
		if err := runRandom(1, 10, 1, false); err != nil {
			t.Fatal(err)
		}
	})
	lines := strings.Split(strings.TrimSpace(output), "\n")
	if len(lines) != 1 {
		t.Errorf("expected 1 value, got %d", len(lines))
	}
}

func TestRunRandom_Count(t *testing.T) {
	output := captureOutput(func() {
		if err := runRandom(1, 100, 5, false); err != nil {
			t.Fatal(err)
		}
	})
	lines := strings.Split(strings.TrimSpace(output), "\n")
	if len(lines) != 5 {
		t.Errorf("expected 5 values, got %d", len(lines))
	}
}

func TestCmd_RunE(t *testing.T) {
	cmd := NewCmd()
	cmd.Flags().Set("min", "1")
	cmd.Flags().Set("max", "10")
	output := captureOutput(func() {
		if err := cmd.RunE(cmd, []string{}); err != nil {
			t.Fatal(err)
		}
	})
	lines := strings.Split(strings.TrimSpace(output), "\n")
	if len(lines) != 1 {
		t.Errorf("expected 1 value, got %d", len(lines))
	}
}

func TestRunRandom_JSON(t *testing.T) {
	output := captureOutput(func() {
		if err := runRandom(1, 10, 3, true); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.HasPrefix(output, "{") || !strings.Contains(output, "values") {
		t.Errorf("expected JSON output with values, got: %s", output)
	}
}

func TestRunRandom_ZeroCount(t *testing.T) {
	output := captureOutput(func() {
		if err := runRandom(5, 10, 0, false); err != nil {
			t.Fatal(err)
		}
	})
	lines := strings.Split(strings.TrimSpace(output), "\n")
	if len(lines) != 1 {
		t.Errorf("expected 1 value (default), got %d", len(lines))
	}
}

func TestCmd_RunE_Count(t *testing.T) {
	cmd := NewCmd()
	cmd.Flags().Set("min", "1")
	cmd.Flags().Set("max", "100")
	cmd.Flags().Set("count", "5")
	output := captureOutput(func() {
		if err := cmd.RunE(cmd, []string{}); err != nil {
			t.Fatal(err)
		}
	})
	lines := strings.Split(strings.TrimSpace(output), "\n")
	if len(lines) != 5 {
		t.Errorf("expected 5 values, got %d", len(lines))
	}
}
