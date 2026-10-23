package cron

import (
	"bytes"
	"encoding/json"
	"io"
	"os"
	"strings"
	"testing"
	"time"
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

func TestRunCron_Describe(t *testing.T) {
	output := captureOutput(func() {
		if err := runCron("0 9 * * 1-5", 0, "", false); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "09:00") {
		t.Errorf("expected 09:00, got: %s", output)
	}
}

func TestRunCron_Next(t *testing.T) {
	output := captureOutput(func() {
		if err := runCron("*/15 * * * *", 3, "", false); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "Next 3 runs") {
		t.Errorf("expected 'Next 3 runs', got: %s", output)
	}
}

func TestRunCron_JSON(t *testing.T) {
	output := captureOutput(func() {
		if err := runCron("0 0 * * *", 2, "", true); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "expression") {
		t.Errorf("expected JSON expression field, got: %s", output)
	}
}

func TestCronExpandFieldWildcard(t *testing.T) {
	got := cronExpandField("*", 0, 59, nil)
	if got != "every" {
		t.Errorf("expected 'every', got %q", got)
	}
}

func TestCronExpandFieldStep(t *testing.T) {
	got := cronExpandField("*/5", 0, 59, nil)
	if got != "every 5" {
		t.Errorf("expected 'every 5', got %q", got)
	}
}

func TestCronExpandFieldRange(t *testing.T) {
	got := cronExpandField("1-5", 0, 59, nil)
	if got != "1-5" {
		t.Errorf("expected '1-5', got %q", got)
	}
}

func TestCronExpandFieldList(t *testing.T) {
	got := cronExpandField("1,3,5", 0, 59, nil)
	if got != "1,3,5" {
		t.Errorf("expected '1,3,5', got %q", got)
	}
}

func TestCronExpandFieldNamed(t *testing.T) {
	got := cronExpandField("jan", 1, 12, cronMonthNames)
	if got != "1" {
		t.Errorf("expected '1', got %q", got)
	}
}

func TestCronExpandFieldInvalidStep(t *testing.T) {
	got := cronExpandField("*/abc", 0, 59, nil)
	if got != "*/abc" {
		t.Errorf("expected '*/abc' (passthrough), got %q", got)
	}
}

func TestCronResolveNameMonth(t *testing.T) {
	got := cronResolveName("jan", cronMonthNames)
	if got != "1" {
		t.Errorf("expected '1', got %q", got)
	}
}

func TestCronResolveNameWeek(t *testing.T) {
	got := cronResolveName("mon", cronWeekNames)
	if got != "1" {
		t.Errorf("expected '1', got %q", got)
	}
}

func TestCronResolveNameUnknown(t *testing.T) {
	got := cronResolveName("foo", cronMonthNames)
	if got != "foo" {
		t.Errorf("expected 'foo', got %q", got)
	}
}

func TestCronZeropadLessThan10(t *testing.T) {
	got := cronZeropad("5")
	if got != "05" {
		t.Errorf("expected '05', got %q", got)
	}
}

func TestCronZeropad12(t *testing.T) {
	got := cronZeropad("12")
	if got != "12" {
		t.Errorf("expected '12', got %q", got)
	}
}

func TestCronZeropadNonNumeric(t *testing.T) {
	got := cronZeropad("every")
	if got != "every" {
		t.Errorf("expected 'every', got %q", got)
	}
}

func TestCronMonthNames(t *testing.T) {
	expected := map[string]int{
		"jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6,
		"jul": 7, "aug": 8, "sep": 9, "oct": 10, "nov": 11, "dec": 12,
	}
	for k, v := range expected {
		if cronMonthNames[k] != v {
			t.Errorf("cronMonthNames[%q] = %d, want %d", k, cronMonthNames[k], v)
		}
	}
}

func TestParseUntil_Empty(t *testing.T) {
	t1, err := parseUntil("")
	if err != nil {
		t.Fatal(err)
	}
	if t1.Year() != 2100 || t1.Month() != 1 || t1.Day() != 1 {
		t.Errorf("expected 2100-01-01, got %v", t1)
	}
}

func TestParseUntil_Valid(t *testing.T) {
	t1, err := parseUntil("2026-12-31")
	if err != nil {
		t.Fatal(err)
	}
	if t1.Year() != 2026 || t1.Month() != 12 || t1.Day() != 31 {
		t.Errorf("expected 2026-12-31, got %v", t1)
	}
}

func TestParseUntil_Invalid(t *testing.T) {
	_, err := parseUntil("not-a-date")
	if err == nil {
		t.Fatal("expected error for invalid date")
	}
}

func TestOutputCronText_EmptyRuns(t *testing.T) {
	out := captureOutput(func() {
		outputCronText("* * * * *", nil)
	})
	if !strings.Contains(out, "Expression:") {
		t.Error("expected 'Expression:' in output")
	}
	if !strings.Contains(out, "every minute") {
		t.Error("expected 'every minute' in output")
	}
}

func TestOutputCronText_WithRuns(t *testing.T) {
	now := time.Now().Truncate(time.Minute)
	then := now.Add(5 * time.Minute)
	runs := []*time.Time{&now, &then}
	out := captureOutput(func() {
		outputCronText("*/5 * * * *", runs)
	})
	if !strings.Contains(out, "Next 2 runs") {
		t.Errorf("expected 'Next 2 runs' in output, got: %s", out)
	}
}

func TestOutputCronJSON_Valid(t *testing.T) {
	now := time.Now()
	runs := []*time.Time{&now}
	out := captureOutput(func() {
		if err := outputCronJSON("0 9 * * *", runs); err != nil {
			t.Fatal(err)
		}
	})
	var result map[string]interface{}
	if err := json.Unmarshal([]byte(out), &result); err != nil {
		t.Fatalf("invalid JSON: %v\noutput: %s", err, out)
	}
	if result["expression"] != "0 9 * * *" {
		t.Errorf("expected expression '0 9 * * *', got %v", result["expression"])
	}
	if _, ok := result["description"]; !ok {
		t.Error("expected description in output")
	}
}

func TestOutputCronJSON_EmptyRuns(t *testing.T) {
	out := captureOutput(func() {
		if err := outputCronJSON("*/15 * * * *", nil); err != nil {
			t.Fatal(err)
		}
	})
	var result map[string]interface{}
	if err := json.Unmarshal([]byte(out), &result); err != nil {
		t.Fatalf("invalid JSON: %v\noutput: %s", err, out)
	}
	if result["expression"] != "*/15 * * * *" {
		t.Errorf("expected expression '*/15 * * * *', got %v", result["expression"])
	}
}

func TestCronWeekNames(t *testing.T) {
	expected := map[string]int{
		"sun": 0, "mon": 1, "tue": 2, "wed": 3, "thu": 4, "fri": 5, "sat": 6,
	}
	for k, v := range expected {
		if cronWeekNames[k] != v {
			t.Errorf("cronWeekNames[%q] = %d, want %d", k, cronWeekNames[k], v)
		}
	}
}
