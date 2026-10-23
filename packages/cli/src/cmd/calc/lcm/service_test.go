package lcm

import (
	"bytes"
	"encoding/json"
	"io"
	"os"
	"strings"
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/calc/internal"
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

func TestLcm(t *testing.T) {
	if internal.Gcd(12, 18) != 6 {
		t.Errorf("Gcd(12,18) = %d, want 6", internal.Gcd(12, 18))
	}
}

func TestRunLcm(t *testing.T) {
	output := captureOutput(func() {
		if err := runLcm(12, 18, false); err != nil {
			t.Fatal(err)
		}
	})
	if strings.TrimSpace(output) != "36" {
		t.Errorf("expected 36, got %q", strings.TrimSpace(output))
	}
}

func TestRunLcm_Json(t *testing.T) {
	output := captureOutput(func() {
		if err := runLcm(12, 18, true); err != nil {
			t.Fatal(err)
		}
	})
	var result map[string]interface{}
	if err := json.Unmarshal([]byte(strings.TrimSpace(output)), &result); err != nil {
		t.Fatalf("invalid json output: %v", err)
	}
	if result["lcm"] != float64(36) {
		t.Errorf("expected lcm 36, got %v", result["lcm"])
	}
}

func TestCmd_RunE(t *testing.T) {
	cmd := NewCmd()
	cmd.Flags().Set("a", "12")
	cmd.Flags().Set("b", "18")
	output := captureOutput(func() {
		if err := cmd.RunE(cmd, []string{}); err != nil {
			t.Fatal(err)
		}
	})
	if strings.TrimSpace(output) != "36" {
		t.Errorf("expected 36, got %q", strings.TrimSpace(output))
	}
}
