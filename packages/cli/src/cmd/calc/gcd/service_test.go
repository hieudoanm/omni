package gcd

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

func TestGcd(t *testing.T) {
	tests := []struct {
		a, b int64
		want int64
	}{
		{12, 18, 6},
		{100, 75, 25},
		{7, 5, 1},
		{0, 5, 5},
		{5, 0, 5},
		{17, 17, 17},
		{1, 1, 1},
		{270, 192, 6},
	}
	for _, tt := range tests {
		if got := internal.Gcd(tt.a, tt.b); got != tt.want {
			t.Errorf("Gcd(%d,%d) = %d, want %d", tt.a, tt.b, got, tt.want)
		}
	}
}

func TestRunGcd(t *testing.T) {
	output := captureOutput(func() {
		if err := runGcd(12, 18, false); err != nil {
			t.Fatal(err)
		}
	})
	if strings.TrimSpace(output) != "6" {
		t.Errorf("expected 6, got %q", strings.TrimSpace(output))
	}
}

func TestRunGcd_Json(t *testing.T) {
	output := captureOutput(func() {
		if err := runGcd(12, 18, true); err != nil {
			t.Fatal(err)
		}
	})
	var result map[string]interface{}
	if err := json.Unmarshal([]byte(strings.TrimSpace(output)), &result); err != nil {
		t.Fatalf("invalid json output: %v", err)
	}
	if result["gcd"] != float64(6) {
		t.Errorf("expected gcd 6, got %v", result["gcd"])
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
	if strings.TrimSpace(output) != "6" {
		t.Errorf("expected 6, got %q", strings.TrimSpace(output))
	}
}
