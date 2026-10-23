package percent

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

func TestPercentOf(t *testing.T) {
	value := 20.0
	of := 50.0
	pct := value / of * 100
	if pct != 40 {
		t.Errorf("20/50*100 = %f, want 40", pct)
	}
}

func TestPercentPlus(t *testing.T) {
	value := 50.0
	pct := 20.0
	result := value * (1 + pct/100)
	if result != 60 {
		t.Errorf("50 + 20%% = %f, want 60", result)
	}
}

func TestPercentMinus(t *testing.T) {
	value := 50.0
	pct := 20.0
	result := value * (1 - pct/100)
	if result != 40 {
		t.Errorf("50 - 20%% = %f, want 40", result)
	}
}

func TestRunPercent_Of(t *testing.T) {
	output := captureOutput(func() {
		if err := runPercent(20, 50, 0, 0, false); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "40.00") {
		t.Errorf("expected 40.00%% in output, got %q", output)
	}
}

func TestRunPercent_Plus(t *testing.T) {
	output := captureOutput(func() {
		if err := runPercent(50, 0, 20, 0, false); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "60.00") {
		t.Errorf("expected 60.00 in output, got %q", output)
	}
}

func TestRunPercent_Minus(t *testing.T) {
	output := captureOutput(func() {
		if err := runPercent(50, 0, 0, 20, false); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "40.00") {
		t.Errorf("expected 40.00 in output, got %q", output)
	}
}

func TestRunPercent_DefaultError(t *testing.T) {
	err := runPercent(50, 0, 0, 0, false)
	if err == nil {
		t.Fatal("expected error when no --of/--plus/--minus specified")
	}
}

func TestRunPercent_Json(t *testing.T) {
	output := captureOutput(func() {
		if err := runPercent(20, 50, 0, 0, true); err != nil {
			t.Fatal(err)
		}
	})
	var result map[string]interface{}
	if err := json.Unmarshal([]byte(strings.TrimSpace(output)), &result); err != nil {
		t.Fatalf("invalid json output: %v", err)
	}
	if result["type"] != "percentage_of" {
		t.Errorf("expected type percentage_of, got %v", result["type"])
	}
}

func TestRunPercent_PlusJson(t *testing.T) {
	output := captureOutput(func() {
		if err := runPercent(50, 0, 20, 0, true); err != nil {
			t.Fatal(err)
		}
	})
	var result map[string]interface{}
	if err := json.Unmarshal([]byte(strings.TrimSpace(output)), &result); err != nil {
		t.Fatalf("invalid json output: %v", err)
	}
	if result["type"] != "add_percentage" {
		t.Errorf("expected type add_percentage, got %v", result["type"])
	}
}

func TestRunPercent_MinusJson(t *testing.T) {
	output := captureOutput(func() {
		if err := runPercent(50, 0, 0, 20, true); err != nil {
			t.Fatal(err)
		}
	})
	var result map[string]interface{}
	if err := json.Unmarshal([]byte(strings.TrimSpace(output)), &result); err != nil {
		t.Fatalf("invalid json output: %v", err)
	}
	if result["type"] != "subtract_percentage" {
		t.Errorf("expected type subtract_percentage, got %v", result["type"])
	}
}
