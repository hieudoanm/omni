package uuid

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

func TestCmd_ExecutesAndProducesOutput(t *testing.T) {
	cmd := NewCommand()
	output := captureOutput(func() {
		if err := cmd.RunE(cmd, []string{}); err != nil {
			t.Fatal(err)
		}
	})
	output = strings.TrimSpace(output)
	if len(output) == 0 {
		t.Fatal("expected non-empty UUID output")
	}
	if len(output) != 36 {
		t.Errorf("expected UUID length 36, got %d: %s", len(output), output)
	}
}

func TestCmd_WithCountAndJSON(t *testing.T) {
	cmd := NewCommand()
	cmd.Flags().Set("count", "3")
	cmd.Flags().Set("json", "true")

	output := captureOutput(func() {
		if err := cmd.RunE(cmd, []string{}); err != nil {
			t.Fatal(err)
		}
	})

	if !strings.Contains(output, `"uuids"`) {
		t.Error("expected JSON output with uuids key")
	}
	if !strings.Contains(output, `"count": 3`) {
		t.Error("expected count 3 in JSON output")
	}
}
