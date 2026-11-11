package tip

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

func TestTipCalculation(t *testing.T) {
	bill := 50.0
	tipPct := 15.0
	split := 4
	tip := bill * tipPct / 100
	total := bill + tip
	perPerson := total / float64(split)
	if tip != 7.5 {
		t.Errorf("tip = %.2f, want 7.5", tip)
	}
	if total != 57.5 {
		t.Errorf("total = %.2f, want 57.5", total)
	}
	if perPerson != 14.375 {
		t.Errorf("perPerson = %.4f, want 14.375", perPerson)
	}
}

func TestRunTip(t *testing.T) {
	output := captureOutput(func() {
		if err := runTip(50, 15, 1, false); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "57.50") {
		t.Errorf("expected total 57.50 in output, got %q", output)
	}
}

func TestRunTip_Split(t *testing.T) {
	output := captureOutput(func() {
		if err := runTip(50, 15, 4, false); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "14.38") {
		t.Errorf("expected per person ~14.38 in output, got %q", output)
	}
}

func TestRunTip_Json(t *testing.T) {
	output := captureOutput(func() {
		if err := runTip(50, 15, 1, true); err != nil {
			t.Fatal(err)
		}
	})
	var result map[string]interface{}
	if err := json.Unmarshal([]byte(strings.TrimSpace(output)), &result); err != nil {
		t.Fatalf("invalid json output: %v", err)
	}
	if result["tip"] != 7.5 {
		t.Errorf("expected tip 7.5, got %v", result["tip"])
	}
}
