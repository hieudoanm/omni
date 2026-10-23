package unit

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

func TestFindUnit(t *testing.T) {
	if u := findUnit("cm"); u == nil || u.cat != "length" {
		t.Error("findUnit('cm') should find length unit")
	}
	if u := findUnit("kg"); u == nil || u.cat != "weight" {
		t.Error("findUnit('kg') should find weight unit")
	}
	if u := findUnit("f"); u == nil || u.cat != "temperature" {
		t.Error("findUnit('f') should find temperature unit")
	}
	if u := findUnit("nonexistent"); u != nil {
		t.Error("findUnit('nonexistent') should return nil")
	}
}

func TestUnitConversion(t *testing.T) {
	inch := findUnit("in")
	meter := findUnit("m")
	if inch == nil || meter == nil {
		t.Fatal("could not find inch or m")
	}
	base := inch.toBase(12)
	result := meter.fromBase(base)
	if math.Abs(result-0.3048) > 1e-4 {
		t.Errorf("12 in = %f m, want 0.3048", result)
	}

	f := findUnit("f")
	c := findUnit("c")
	if f == nil || c == nil {
		t.Fatal("could not find f or c")
	}
	base = f.toBase(32)
	result = c.fromBase(base)
	if math.Abs(result) > 0.01 {
		t.Errorf("32F = %f C, want 0", result)
	}
}

func TestRunUnit(t *testing.T) {
	output := captureOutput(func() {
		if err := runUnit(12, "in", "cm", false); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "30.48") && !strings.Contains(output, "30.479999999999997") {
		t.Errorf("expected ~30.48 cm in output, got %q", output)
	}
}

func TestRunUnit_InvalidFrom(t *testing.T) {
	err := runUnit(12, "nonexistent", "cm", false)
	if err == nil {
		t.Fatal("expected error for unknown unit")
	}
}

func TestRunUnit_InvalidTo(t *testing.T) {
	err := runUnit(12, "cm", "nonexistent", false)
	if err == nil {
		t.Fatal("expected error for unknown unit")
	}
}

func TestRunUnit_CategoryMismatch(t *testing.T) {
	err := runUnit(12, "cm", "kg", false)
	if err == nil {
		t.Fatal("expected error for category mismatch")
	}
}

func TestRunUnit_Json(t *testing.T) {
	output := captureOutput(func() {
		if err := runUnit(32, "f", "c", true); err != nil {
			t.Fatal(err)
		}
	})
	var result map[string]interface{}
	if err := json.Unmarshal([]byte(strings.TrimSpace(output)), &result); err != nil {
		t.Fatalf("invalid json output: %v", err)
	}
	if result["category"] != "temperature" {
		t.Errorf("expected category temperature, got %v", result["category"])
	}
}

func TestCmd_RunE(t *testing.T) {
	cmd := NewCmd()
	cmd.Flags().Set("value", "12")
	cmd.Flags().Set("from", "in")
	cmd.Flags().Set("to", "cm")
	output := captureOutput(func() {
		if err := cmd.RunE(cmd, []string{}); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "30.48") && !strings.Contains(output, "30.479999999999997") {
		t.Errorf("expected ~30.48 cm in output, got %q", output)
	}
}
