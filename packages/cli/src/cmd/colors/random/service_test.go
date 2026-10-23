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
	return strings.TrimRight(buf.String(), "\n")
}

func TestRunRandom_Count(t *testing.T) {
	cmd := newCmd()
	if err := cmd.Flags().Set("max", "3"); err != nil {
		t.Fatal(err)
	}
	var lines []string
	for i := 0; i < 5; i++ {
		output := captureOutput(func() {
			if err := cmd.RunE(cmd, nil); err != nil {
				t.Fatal(err)
			}
		})
		lines = strings.Split(strings.TrimSpace(output), "\n")
		if len(lines) == 3 {
			break
		}
	}
	if len(lines) != 3 {
		t.Errorf("expected 3 lines, got %d", len(lines))
	}
	for _, line := range lines {
		if !strings.Contains(line, "rgb(") {
			t.Errorf("expected rgb() in line %q", line)
		}
	}
}
