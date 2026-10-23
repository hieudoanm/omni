package factorial

import (
	"bytes"
	"encoding/json"
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

func TestRunFactorial(t *testing.T) {
	output := captureOutput(func() {
		if err := runFactorial(5, false); err != nil {
			t.Fatal(err)
		}
	})
	if strings.TrimSpace(output) != "120" {
		t.Errorf("expected 120, got %q", strings.TrimSpace(output))
	}
}

func TestRunFactorial_Negative(t *testing.T) {
	err := runFactorial(-1, false)
	if err == nil {
		t.Fatal("expected error for negative number")
	}
	if !strings.Contains(err.Error(), "undefined") {
		t.Errorf("expected undefined error, got %v", err)
	}
}

func TestRunFactorial_Json(t *testing.T) {
	output := captureOutput(func() {
		if err := runFactorial(5, true); err != nil {
			t.Fatal(err)
		}
	})
	var result map[string]interface{}
	if err := json.Unmarshal([]byte(strings.TrimSpace(output)), &result); err != nil {
		t.Fatalf("invalid json output: %v", err)
	}
	if result["factorial"] != "120" {
		t.Errorf("expected factorial 120, got %v", result["factorial"])
	}
}

func TestCmd_RunE(t *testing.T) {
	cmd := NewCmd()
	cmd.Flags().Set("number", "5")
	output := captureOutput(func() {
		if err := cmd.RunE(cmd, []string{}); err != nil {
			t.Fatal(err)
		}
	})
	if strings.TrimSpace(output) != "120" {
		t.Errorf("expected 120, got %q", strings.TrimSpace(output))
	}
}
