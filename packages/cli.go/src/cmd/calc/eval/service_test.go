package eval

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

func TestEvalSimple(t *testing.T) {
	tests := []struct {
		expr string
		want float64
	}{
		{"2+2", 4},
		{"10-3", 7},
		{"3*4", 12},
		{"10/2", 5},
		{"2^3", 8},
		{"-5", -5},
		{"+5", 5},
	}
	for _, tt := range tests {
		e := newEvaluator(tt.expr)
		got, err := e.eval()
		if err != nil {
			t.Errorf("eval(%q) unexpected error: %v", tt.expr, err)
			continue
		}
		if got != tt.want {
			t.Errorf("eval(%q) = %v, want %v", tt.expr, got, tt.want)
		}
	}
}

func TestEvalPrecedence(t *testing.T) {
	e := newEvaluator("2+3*4")
	got, err := e.eval()
	if err != nil || got != 14 {
		t.Errorf("eval('2+3*4') = %v, want 14 (err=%v)", got, err)
	}

	e = newEvaluator("(2+3)*4")
	got, err = e.eval()
	if err != nil || got != 20 {
		t.Errorf("eval('(2+3)*4') = %v, want 20 (err=%v)", got, err)
	}

	e = newEvaluator("2^3^2")
	got, err = e.eval()
	if err != nil || got != 512 {
		t.Errorf("eval('2^3^2') = %v, want 512 (err=%v)", got, err)
	}
}

func TestEvalFunctions(t *testing.T) {
	e := newEvaluator("sqrt(144)")
	got, err := e.eval()
	if err != nil || got != 12 {
		t.Errorf("eval('sqrt(144)') = %v, want 12 (err=%v)", got, err)
	}

	e = newEvaluator("sin(0)")
	got, err = e.eval()
	if err != nil || math.Abs(got) > 1e-10 {
		t.Errorf("eval('sin(0)') = %v, want 0 (err=%v)", got, err)
	}

	e = newEvaluator("cos(0)")
	got, err = e.eval()
	if err != nil || math.Abs(got-1) > 1e-10 {
		t.Errorf("eval('cos(0)') = %v, want 1 (err=%v)", got, err)
	}

	e = newEvaluator("abs(-5)")
	got, err = e.eval()
	if err != nil || got != 5 {
		t.Errorf("eval('abs(-5)') = %v, want 5 (err=%v)", got, err)
	}

	e = newEvaluator("floor(3.7)")
	got, err = e.eval()
	if err != nil || got != 3 {
		t.Errorf("eval('floor(3.7)') = %v, want 3 (err=%v)", got, err)
	}

	e = newEvaluator("ceil(3.2)")
	got, err = e.eval()
	if err != nil || got != 4 {
		t.Errorf("eval('ceil(3.2)') = %v, want 4 (err=%v)", got, err)
	}

	e = newEvaluator("round(3.5)")
	got, err = e.eval()
	if err != nil || got != 4 {
		t.Errorf("eval('round(3.5)') = %v, want 4 (err=%v)", got, err)
	}

	e = newEvaluator("tan(0)")
	got, err = e.eval()
	if err != nil || math.Abs(got) > 1e-10 {
		t.Errorf("eval('tan(0)') = %v, want 0 (err=%v)", got, err)
	}
}

func TestEvalConstants(t *testing.T) {
	e := newEvaluator("pi")
	got, err := e.eval()
	if err != nil || math.Abs(got-math.Pi) > 1e-10 {
		t.Errorf("eval('pi') = %v, want %v (err=%v)", got, math.Pi, err)
	}

	e = newEvaluator("e")
	got, err = e.eval()
	if err != nil || math.Abs(got-math.E) > 1e-10 {
		t.Errorf("eval('e') = %v, want %v (err=%v)", got, math.E, err)
	}
}

func TestEvalErrors(t *testing.T) {
	tests := []string{
		"1/0",
		"unknown(5)",
		"sqrt",
		"2+",
		"(",
		")",
	}
	for _, expr := range tests {
		e := newEvaluator(expr)
		_, err := e.eval()
		if err == nil {
			t.Errorf("eval(%q) expected error, got nil", expr)
		}
	}
}

func TestEvalLogExp(t *testing.T) {
	e := newEvaluator("log(1)")
	got, err := e.eval()
	if err != nil || math.Abs(got) > 1e-10 {
		t.Errorf("eval('log(1)') = %v, want 0 (err=%v)", got, err)
	}

	e = newEvaluator("log10(100)")
	got, err = e.eval()
	if err != nil || got != 2 {
		t.Errorf("eval('log10(100)') = %v, want 2 (err=%v)", got, err)
	}

	e = newEvaluator("exp(0)")
	got, err = e.eval()
	if err != nil || math.Abs(got-1) > 1e-10 {
		t.Errorf("eval('exp(0)') = %v, want 1 (err=%v)", got, err)
	}
}

func TestEvalIdentifierWithoutParens(t *testing.T) {
	e := newEvaluator("sqrt")
	_, err := e.eval()
	if err == nil {
		t.Error("expected error for 'sqrt' without parentheses")
	}
}

func TestCmd_RunE(t *testing.T) {
	cmd := NewCmd()
	cmd.Flags().Set("expression", "2+2")
	output := captureOutput(func() {
		if err := cmd.RunE(cmd, []string{}); err != nil {
			t.Fatal(err)
		}
	})
	if strings.TrimSpace(output) != "4" {
		t.Errorf("expected 4, got %q", strings.TrimSpace(output))
	}
}

func TestCmd_RunE_Json(t *testing.T) {
	cmd := NewCmd()
	cmd.Flags().Set("expression", "sqrt(144)")
	cmd.Flags().Set("json", "true")
	output := captureOutput(func() {
		if err := cmd.RunE(cmd, []string{}); err != nil {
			t.Fatal(err)
		}
	})
	var result map[string]interface{}
	if err := json.Unmarshal([]byte(strings.TrimSpace(output)), &result); err != nil {
		t.Fatalf("invalid json output: %v", err)
	}
	if result["result"] != float64(12) {
		t.Errorf("expected result 12, got %v", result["result"])
	}
}
