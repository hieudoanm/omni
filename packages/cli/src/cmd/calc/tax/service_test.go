package tax

import (
	"bytes"
	"io"
	"math"
	"os"
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

func TestToMonthly(t *testing.T) {
	if toMonthly(120, Annual) != 10 {
		t.Error("toMonthly Annual failed")
	}
	if toMonthly(10, Monthly) != 10 {
		t.Error("toMonthly Monthly failed")
	}
}

func TestClampInsuranceBase(t *testing.T) {
	if clampInsuranceBase(50_000_000, true) != InsuranceCap {
		t.Errorf("Expected insurance cap %v, got %v", InsuranceCap, clampInsuranceBase(50_000_000, true))
	}
	if clampInsuranceBase(10_000_000, true) != 10_000_000 {
		t.Error("Should not clamp below cap")
	}
	if clampInsuranceBase(10_000_000, false) != 0 {
		t.Error("Should return 0 if insurance disabled")
	}
}

func TestCalculateTax(t *testing.T) {
	breakdown, total := calculateTax(0)
	if total != 0 || len(breakdown) != 0 {
		t.Errorf("calculateTax(0) failed: total=%v, len=%v", total, len(breakdown))
	}

	breakdown, total = calculateTax(10_000_000)
	if total != 750_000 {
		t.Errorf("calculateTax(10M) failed: total=%v; expected 750,000", total)
	}
	if len(breakdown) != 2 {
		t.Errorf("calculateTax(10M) expected 2 brackets, got %d", len(breakdown))
	}
}

func TestSumRates(t *testing.T) {
	total := sumRates(employeeInsurance)
	expected := 0.08 + 0.015 + 0.01
	if total != expected {
		t.Errorf("sumRates = %v, want %v", total, expected)
	}

	total = sumRates(map[string]float64{})
	if total != 0 {
		t.Errorf("sumRates(empty) = %v, want 0", total)
	}
}

func TestSolveGrossFromNet(t *testing.T) {
	targetNet := 20_000_000.0
	gross := solveGrossFromNet(targetNet, 0, true)

	base := clampInsuranceBase(gross, true)
	ins := base * sumRates(employeeInsurance)
	deductions := PersonalDeduction + ins
	taxable := math.Max(0, gross-deductions)
	_, tax := calculateTax(taxable)
	net := gross - ins - tax

	if math.Abs(net-targetNet) > 1 {
		t.Errorf("solveGrossFromNet failed: target=%v, got=%v (gross=%v)", targetNet, net, gross)
	}
}

func TestSolveGrossFromNetNoInsurance(t *testing.T) {
	targetNet := 10_000_000.0
	gross := solveGrossFromNet(targetNet, 0, false)

	ins := 0.0
	deductions := PersonalDeduction + ins
	taxable := math.Max(0, gross-deductions)
	_, tax := calculateTax(taxable)
	net := gross - ins - tax

	if math.Abs(net-targetNet) > 1 {
		t.Errorf("solveGrossFromNet(no insurance) failed: target=%v, got=%v (gross=%v)", targetNet, net, gross)
	}
}

func TestSolveGrossFromNetWithDependents(t *testing.T) {
	targetNet := 15_000_000.0
	gross := solveGrossFromNet(targetNet, 2, true)

	base := clampInsuranceBase(gross, true)
	ins := base * sumRates(employeeInsurance)
	deductions := PersonalDeduction + 2*DependentDeduction + ins
	taxable := math.Max(0, gross-deductions)
	_, tax := calculateTax(taxable)
	net := gross - ins - tax

	if math.Abs(net-targetNet) > 1 {
		t.Errorf("solveGrossFromNet(with dependents) failed: target=%v, got=%v (gross=%v)", targetNet, net, gross)
	}
}

func TestCalculateTaxEdge(t *testing.T) {
	breakdown, total := calculateTax(2_000_000)
	if total != 100_000 {
		t.Errorf("calculateTax(2M) = %v, want 100,000", total)
	}
	if len(breakdown) != 1 {
		t.Errorf("calculateTax(2M) expected 1 bracket, got %d", len(breakdown))
	}

	_, total = calculateTax(100_000_000)
	if total <= 0 {
		t.Errorf("calculateTax(100M) should be positive")
	}

	breakdown, total = calculateTax(-1000)
	if total != 0 || len(breakdown) != 0 {
		t.Errorf("calculateTax(-1000) = total=%v, len=%d, want 0,0", total, len(breakdown))
	}
}

func TestClampInsuranceBaseExact(t *testing.T) {
	if clampInsuranceBase(InsuranceCap, true) != InsuranceCap {
		t.Errorf("clampInsuranceBase(cap) = %v, want %v", clampInsuranceBase(InsuranceCap, true), InsuranceCap)
	}
}

func TestCmd_RunE_MissingIncome(t *testing.T) {
	cmd := NewCmd()
	err := cmd.RunE(cmd, []string{})
	if err == nil {
		t.Error("expected error for missing income")
	}
}

func TestCmd_RunE_InvalidMode(t *testing.T) {
	cmd := NewCmd()
	cmd.Flags().Set("mode", "invalid")
	cmd.Flags().Set("income", "10000000")
	err := cmd.RunE(cmd, []string{})
	if err == nil {
		t.Error("expected error for invalid mode")
	}
}

func TestCmd_RunE_InvalidPeriod(t *testing.T) {
	cmd := NewCmd()
	cmd.Flags().Set("period", "invalid")
	cmd.Flags().Set("income", "10000000")
	err := cmd.RunE(cmd, []string{})
	if err == nil {
		t.Error("expected error for invalid period")
	}
}

func TestCmd_RunE_Success(t *testing.T) {
	cmd := NewCmd()
	cmd.Flags().Set("income", "15000000")
	cmd.Flags().Set("dependents", "1")
	err := cmd.RunE(cmd, []string{})
	if err != nil {
		t.Errorf("unexpected error: %v", err)
	}
}

func TestCmd_RunE_JSON(t *testing.T) {
	cmd := NewCmd()
	cmd.Flags().Set("income", "15000000")
	cmd.Flags().Set("json", "true")
	err := cmd.RunE(cmd, []string{})
	if err != nil {
		t.Errorf("unexpected error: %v", err)
	}
}

func TestCmd_RunE_NetMode(t *testing.T) {
	cmd := NewCmd()
	cmd.Flags().Set("mode", "net")
	cmd.Flags().Set("income", "12000000")
	err := cmd.RunE(cmd, []string{})
	if err != nil {
		t.Errorf("unexpected error: %v", err)
	}
}
