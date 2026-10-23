package discount

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

func TestDiscount(t *testing.T) {
	original := 100.0
	percent := 20.0
	discount := original * percent / 100
	final := original - discount
	if discount != 20 {
		t.Errorf("discount = %.2f, want 20", discount)
	}
	if final != 80 {
		t.Errorf("final = %.2f, want 80", final)
	}
}

func TestRunDiscount(t *testing.T) {
	output := captureOutput(func() {
		if err := runDiscount(100, 20, false); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "80.00") {
		t.Errorf("expected final price 80.00 in output, got %q", output)
	}
	if !strings.Contains(output, "20.00") {
		t.Errorf("expected discount 20.00 in output, got %q", output)
	}
}

func TestRunDiscount_Json(t *testing.T) {
	output := captureOutput(func() {
		if err := runDiscount(100, 20, true); err != nil {
			t.Fatal(err)
		}
	})
	var result map[string]interface{}
	if err := json.Unmarshal([]byte(strings.TrimSpace(output)), &result); err != nil {
		t.Fatalf("invalid json output: %v", err)
	}
	if result["final_price"] != 80.0 {
		t.Errorf("expected final_price 80, got %v", result["final_price"])
	}
}

func TestCmd_RunE(t *testing.T) {
	cmd := NewCmd()
	cmd.Flags().Set("original", "100")
	cmd.Flags().Set("percent", "20")
	output := captureOutput(func() {
		if err := cmd.RunE(cmd, []string{}); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "80.00") {
		t.Errorf("expected final price 80.00 in output, got %q", output)
	}
}
