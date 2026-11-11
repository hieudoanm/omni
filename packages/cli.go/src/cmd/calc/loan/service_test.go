package loan

import (
	"bytes"
	"encoding/json"
	"io"
	"math"
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

func TestLoanPayment(t *testing.T) {
	r := 5.0 / 100.0 / 12
	n := 5.0 * 12
	p := 30000.0
	payment := p * r * math.Pow(1+r, n) / (math.Pow(1+r, n) - 1)
	if math.Abs(payment-566.14) > 0.1 {
		t.Errorf("loan payment = %.2f, want ~566.14", payment)
	}
}

func TestRunLoan(t *testing.T) {
	output := captureOutput(func() {
		if err := runLoan(30000, 5, 5, false); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "566.14") {
		t.Errorf("expected monthly ~566.14 in output, got %q", output)
	}
}

func TestRunLoan_Json(t *testing.T) {
	output := captureOutput(func() {
		if err := runLoan(30000, 5, 5, true); err != nil {
			t.Fatal(err)
		}
	})
	var result map[string]interface{}
	if err := json.Unmarshal([]byte(strings.TrimSpace(output)), &result); err != nil {
		t.Fatalf("invalid json output: %v", err)
	}
	monthly, ok := result["monthly"].(float64)
	if !ok {
		t.Fatalf("monthly is not a float64, got %T", result["monthly"])
	}
	if monthly < 566 || monthly > 567 {
		t.Errorf("expected monthly ~566.14, got %v", monthly)
	}
}

func TestCmd_RunE(t *testing.T) {
	cmd := NewCmd()
	cmd.Flags().Set("principal", "30000")
	cmd.Flags().Set("rate", "5")
	cmd.Flags().Set("years", "5")
	output := captureOutput(func() {
		if err := cmd.RunE(cmd, []string{}); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "566.14") {
		t.Errorf("expected monthly ~566.14 in output, got %q", output)
	}
}
