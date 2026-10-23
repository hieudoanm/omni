package bmi

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

func TestBmiCategory(t *testing.T) {
	tests := []struct {
		bmi      float64
		category string
	}{
		{16, "Underweight"},
		{20, "Normal"},
		{27, "Overweight"},
		{35, "Obese"},
	}
	for _, tt := range tests {
		if got := bmiCategory(tt.bmi); got != tt.category {
			t.Errorf("bmiCategory(%.1f) = %q, want %q", tt.bmi, got, tt.category)
		}
	}
}

func TestRunBMI_Text(t *testing.T) {
	output := captureOutput(func() {
		if err := runBMI(70, 175, false); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "BMI:") {
		t.Errorf("expected BMI in output, got %q", output)
	}
}

func TestRunBMI_JSON(t *testing.T) {
	output := captureOutput(func() {
		if err := runBMI(70, 175, true); err != nil {
			t.Fatal(err)
		}
	})
	var result map[string]interface{}
	if err := json.Unmarshal([]byte(strings.TrimSpace(output)), &result); err != nil {
		t.Fatalf("invalid json output: %v", err)
	}
	if result["category"] != "Normal" {
		t.Errorf("expected Normal category, got %v", result["category"])
	}
}
