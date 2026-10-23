package date

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

func TestRunDate_AddDays(t *testing.T) {
	cmd := NewCmd()
	cmd.Flags().Set("add", "7")
	output := captureOutput(func() {
		if err := cmd.RunE(cmd, []string{}); err != nil {
			t.Fatal(err)
		}
	})
	if output == "" {
		t.Error("expected non-empty output")
	}
}

func TestRunDate_InvalidDate(t *testing.T) {
	cmd := NewCmd()
	err := cmd.RunE(cmd, []string{"not-a-date"})
	if err == nil {
		t.Fatal("expected error for invalid date")
	}
	if !strings.Contains(err.Error(), "invalid date") {
		t.Errorf("expected invalid date error, got %v", err)
	}
}

func TestRunDate_Diff(t *testing.T) {
	cmd := NewCmd()
	cmd.Flags().Set("diff", "2026-01-01")
	output := captureOutput(func() {
		if err := cmd.RunE(cmd, []string{"2026-06-01"}); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "days") {
		t.Errorf("expected days in output, got %q", output)
	}
}

func TestRunDate_Json(t *testing.T) {
	cmd := NewCmd()
	cmd.Flags().Set("add", "7")
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
	if result["date"] == "" {
		t.Error("expected date in json output")
	}
}

func TestRunDate_AddMonths(t *testing.T) {
	cmd := NewCmd()
	cmd.Flags().Set("add-months", "3")
	output := captureOutput(func() {
		if err := cmd.RunE(cmd, []string{}); err != nil {
			t.Fatal(err)
		}
	})
	if output == "" {
		t.Error("expected non-empty output")
	}
}

func TestRunDate_AddYears(t *testing.T) {
	cmd := NewCmd()
	cmd.Flags().Set("add-years", "5")
	output := captureOutput(func() {
		if err := cmd.RunE(cmd, []string{}); err != nil {
			t.Fatal(err)
		}
	})
	if output == "" {
		t.Error("expected non-empty output")
	}
}

func TestRunDate_DiffToday(t *testing.T) {
	cmd := NewCmd()
	cmd.Flags().Set("diff", "2026-01-01")
	output := captureOutput(func() {
		if err := cmd.RunE(cmd, []string{}); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "days") {
		t.Errorf("expected days in output, got %q", output)
	}
}

func TestRunDate_DiffJson(t *testing.T) {
	cmd := NewCmd()
	cmd.Flags().Set("diff", "2026-01-01")
	cmd.Flags().Set("json", "true")
	output := captureOutput(func() {
		if err := cmd.RunE(cmd, []string{"2026-06-01"}); err != nil {
			t.Fatal(err)
		}
	})
	var result map[string]interface{}
	if err := json.Unmarshal([]byte(strings.TrimSpace(output)), &result); err != nil {
		t.Fatalf("invalid json output: %v", err)
	}
	if result["days"] == nil {
		t.Error("expected days in json output")
	}
}

func TestRunDate_Format(t *testing.T) {
	cmd := NewCmd()
	cmd.Flags().Set("format", "January 2, 2006")
	output := captureOutput(func() {
		if err := cmd.RunE(cmd, []string{}); err != nil {
			t.Fatal(err)
		}
	})
	if output == "" {
		t.Error("expected non-empty output")
	}
}

func TestRunDate_InvalidSecondDate(t *testing.T) {
	cmd := NewCmd()
	cmd.Flags().Set("diff", "2026-01-01")
	err := cmd.RunE(cmd, []string{"2026-06-01", "not-a-date"})
	if err == nil || !strings.Contains(err.Error(), "invalid date") {
		t.Errorf("expected invalid date error, got %v", err)
	}
}
