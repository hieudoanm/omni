package mortgage

import (
	"bytes"
	"io"
	"math"
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

func TestCalcPayment(t *testing.T) {
	p := internal.CalcPayment(300000, 6.5, 30)
	expected := 1896.20
	if math.Abs(p-expected) > 0.1 {
		t.Errorf("CalcPayment(300000, 6.5, 30) = %.2f, want %.2f", p, expected)
	}

	p = internal.CalcPayment(100000, 0, 10)
	expected = 833.33
	if math.Abs(p-expected) > 0.1 {
		t.Errorf("CalcPayment(100000, 0, 10) = %.2f, want %.2f", p, expected)
	}
}

func TestRunMortgage(t *testing.T) {
	output := captureOutput(func() {
		if err := runMortgage(300000, 6.5, 30, 0, 0, 0, false); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "1896.20") {
		t.Errorf("expected monthly ~1896.20 in output, got %q", output)
	}
}

func TestRunMortgage_WithExtras(t *testing.T) {
	output := captureOutput(func() {
		if err := runMortgage(300000, 6.5, 30, 3000, 1200, 0, false); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "1896.20") {
		t.Errorf("expected P&I ~1896.20 in output, got %q", output)
	}
	if !strings.Contains(output, "250.00") {
		t.Errorf("expected monthly taxes 250.00 in output, got %q", output)
	}
}

func TestCmd_RunE(t *testing.T) {
	cmd := NewCmd()
	cmd.Flags().Set("principal", "300000")
	cmd.Flags().Set("rate", "6.5")
	cmd.Flags().Set("years", "30")
	output := captureOutput(func() {
		if err := cmd.RunE(cmd, []string{}); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "1896.20") {
		t.Errorf("expected monthly ~1896.20 in output, got %q", output)
	}
}
