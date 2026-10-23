package compound

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

func TestCompoundingPeriods(t *testing.T) {
	tests := []struct {
		freq string
		want float64
	}{
		{"daily", 365},
		{"monthly", 12},
		{"quarterly", 4},
		{"yearly", 1},
		{"unknown", 1},
	}
	for _, tt := range tests {
		if got := compoundingPeriods(tt.freq); got != tt.want {
			t.Errorf("compoundingPeriods(%q) = %v, want %v", tt.freq, got, tt.want)
		}
	}
}

func TestFutureValue(t *testing.T) {
	fv, deposits := futureValue(10000, 5, 10, 0, 1)
	expected := 10000 * math.Pow(1.05, 10)
	if math.Abs(fv-expected) > 0.01 {
		t.Errorf("futureValue no contributions = %v, want %v", fv, expected)
	}
	if deposits != 10000 {
		t.Errorf("deposits = %v, want 10000", deposits)
	}

	fv, deposits = futureValue(0, 5, 10, 100, 1)
	expected = 100 * (math.Pow(1.05, 10) - 1) / 0.05
	if math.Abs(fv-expected) > 0.01 {
		t.Errorf("futureValue with contributions = %v, want %v", fv, expected)
	}
	if deposits != 1000 {
		t.Errorf("deposits = %v, want 1000", deposits)
	}

	fv, deposits = futureValue(1000, 0, 5, 50, 12)
	if fv != 1000+50*12*5 {
		t.Errorf("futureValue zero rate = %v, want %v", fv, 1000+50*12*5)
	}
}

func TestYearBreakdown(t *testing.T) {
	rows := yearBreakdown(1000, 10, 3, 0, 1)
	if len(rows) != 3 {
		t.Fatalf("expected 3 rows, got %d", len(rows))
	}
	if math.Abs(rows[0].Balance-1100) > 0.01 {
		t.Errorf("year 1 balance = %v, want 1100", rows[0].Balance)
	}
	expected := 1000 * math.Pow(1.10, 3)
	if math.Abs(rows[2].Balance-expected) > 0.01 {
		t.Errorf("year 3 balance = %v, want %v", rows[2].Balance, expected)
	}

	rows = yearBreakdown(1000, 0, 2, 100, 12)
	if len(rows) != 2 {
		t.Fatalf("expected 2 rows, got %d", len(rows))
	}
	expectedTotal := 1000.0 + 100.0*12*2
	if math.Abs(rows[1].Balance-expectedTotal) > 0.01 {
		t.Errorf("year 2 balance (zero rate) = %v, want %v", rows[1].Balance, expectedTotal)
	}
}

func TestRunCompound(t *testing.T) {
	captureOutput(func() {
		err := runCompound(10000, 5, 10, 0, "yearly", false)
		if err != nil {
			t.Fatal(err)
		}
	})
}

func TestRunCompound_Json(t *testing.T) {
	output := captureOutput(func() {
		err := runCompound(10000, 5, 10, 0, "yearly", true)
		if err != nil {
			t.Fatal(err)
		}
	})
	var result map[string]interface{}
	if err := json.Unmarshal([]byte(strings.TrimSpace(output)), &result); err != nil {
		t.Fatalf("invalid json output: %v", err)
	}
	if result["future_value"] == nil {
		t.Error("expected future_value in json output")
	}
}

func TestRunCompound_WithContributions(t *testing.T) {
	output := captureOutput(func() {
		err := runCompound(10000, 5, 10, 100, "monthly", false)
		if err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "Compound Interest") {
		t.Errorf("expected 'Compound Interest' in output, got %q", output)
	}
}

func TestRunCompound_Daily(t *testing.T) {
	output := captureOutput(func() {
		err := runCompound(10000, 5, 10, 0, "daily", false)
		if err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "Compound Interest") {
		t.Errorf("expected 'Compound Interest' in output, got %q", output)
	}
}

func TestRunCompound_Quarterly(t *testing.T) {
	output := captureOutput(func() {
		err := runCompound(10000, 5, 10, 0, "quarterly", false)
		if err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "Compound Interest") {
		t.Errorf("expected 'Compound Interest' in output, got %q", output)
	}
}
