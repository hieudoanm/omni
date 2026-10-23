package epoch

import (
	"bytes"
	"encoding/json"
	"io"
	"os"
	"strconv"
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

func TestRunEpoch_FromDateJSON(t *testing.T) {
	output := captureOutput(func() {
		if err := runEpoch([]string{}, "2024-06-11", "", "", false, false, true); err != nil {
			t.Fatal(err)
		}
	})
	var result map[string]interface{}
	if err := json.Unmarshal([]byte(output), &result); err != nil {
		t.Fatalf("invalid JSON: %v\noutput: %s", err, output)
	}
	if _, ok := result["epoch"]; !ok {
		t.Error("expected epoch field")
	}
	if _, ok := result["rfc3339"]; !ok {
		t.Error("expected rfc3339 field")
	}
}

func TestRunEpoch_FromDateNumeric(t *testing.T) {
	output := captureOutput(func() {
		if err := runEpoch([]string{}, "2024-06-11", "", "", false, false, false); err != nil {
			t.Fatal(err)
		}
	})
	n, err := strconv.ParseInt(strings.TrimSpace(output), 10, 64)
	if err != nil {
		t.Errorf("expected numeric output, got %q: %v", output, err)
	}
	if n <= 0 {
		t.Errorf("expected positive epoch, got %d", n)
	}
}

func TestRunEpoch_RelativeJSON(t *testing.T) {
	output := captureOutput(func() {
		if err := runEpoch([]string{}, "", "2 hours ago", "", false, false, true); err != nil {
			t.Fatal(err)
		}
	})
	var result map[string]interface{}
	if err := json.Unmarshal([]byte(output), &result); err != nil {
		t.Fatalf("invalid JSON: %v\noutput: %s", err, output)
	}
	if _, ok := result["epoch"]; !ok {
		t.Error("expected epoch field")
	}
	if _, ok := result["rfc3339"]; !ok {
		t.Error("expected rfc3339 field")
	}
}

func TestRunEpoch_ISOOutput(t *testing.T) {
	output := captureOutput(func() {
		if err := runEpoch([]string{"1718100000"}, "", "", "", true, false, false); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "2024") {
		t.Errorf("expected year 2024 in output, got: %s", output)
	}
	if !strings.Contains(output, "T") {
		t.Errorf("expected ISO 8601 format (with T), got: %s", output)
	}
}

func TestRunEpoch_NoArgs(t *testing.T) {
	output := captureOutput(func() {
		if err := runEpoch([]string{}, "", "", "", false, false, false); err != nil {
			t.Fatal(err)
		}
	})
	if output == "" {
		t.Error("expected non-empty output for current time")
	}
}

func TestRunEpoch_InvalidArg(t *testing.T) {
	err := runEpoch([]string{"not-a-timestamp"}, "", "", "", false, false, false)
	if err == nil {
		t.Fatal("expected error for invalid timestamp")
	}
}

func TestRunEpoch_UnixFlag(t *testing.T) {
	output := captureOutput(func() {
		if err := runEpoch([]string{"1718100000"}, "", "", "", false, true, false); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "1718100000") {
		t.Errorf("expected 1718100000 in output, got: %s", output)
	}
}

func TestRunEpoch_KnownTimestamp(t *testing.T) {
	output := captureOutput(func() {
		if err := runEpoch([]string{"1718100000"}, "", "", "", false, false, false); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "2024") {
		t.Errorf("expected year 2024 in output, got: %s", output)
	}
	if !strings.Contains(output, "06") && !strings.Contains(output, "Jun") {
		t.Errorf("expected June in output, got: %s", output)
	}
	if !strings.Contains(output, "11") {
		t.Errorf("expected day 11 in output, got: %s", output)
	}
}

func TestRunEpoch_JSONOutput(t *testing.T) {
	output := captureOutput(func() {
		if err := runEpoch([]string{"1718100000"}, "", "", "", false, false, true); err != nil {
			t.Fatal(err)
		}
	})
	var result map[string]interface{}
	if err := json.Unmarshal([]byte(output), &result); err != nil {
		t.Fatalf("invalid JSON output: %v\noutput: %s", err, output)
	}
	if result["epoch"] != float64(1718100000) {
		t.Errorf("expected epoch 1718100000, got %v", result["epoch"])
	}
	rfc3339, ok := result["rfc3339"].(string)
	if !ok {
		t.Fatalf("expected rfc3339 to be a string, got %T", result["rfc3339"])
	}
	if !strings.Contains(rfc3339, "2024") {
		t.Errorf("expected rfc3339 to contain 2024, got %s", rfc3339)
	}
}

func TestRunEpoch_FormatFlag(t *testing.T) {
	output := captureOutput(func() {
		if err := runEpoch([]string{"1718100000"}, "", "", "2006-01-02", false, false, false); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "2024-06-11") {
		t.Errorf("expected formatted date 2024-06-11, got: %s", output)
	}
}

func TestRunEpoch_NoArgsJSON(t *testing.T) {
	output := captureOutput(func() {
		if err := runEpoch([]string{}, "", "", "", false, false, true); err != nil {
			t.Fatal(err)
		}
	})
	var result map[string]interface{}
	if err := json.Unmarshal([]byte(output), &result); err != nil {
		t.Fatalf("invalid JSON: %v\noutput: %s", err, output)
	}
	if _, ok := result["epoch"]; !ok {
		t.Error("expected epoch field")
	}
	if _, ok := result["rfc3339"]; !ok {
		t.Error("expected rfc3339 field")
	}
}

func TestParseEpochDateStringRFC3339(t *testing.T) {
	tm, err := parseEpochDateString("2024-06-11T15:04:05Z")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if tm.Year() != 2024 || tm.Month() != 6 || tm.Day() != 11 {
		t.Errorf("unexpected date: %v", tm)
	}
}

func TestParseEpochDateStringYYYYMMDD(t *testing.T) {
	tm, err := parseEpochDateString("2024-06-11")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if tm.Year() != 2024 || tm.Month() != 6 || tm.Day() != 11 {
		t.Errorf("unexpected date: %v", tm)
	}
}

func TestParseEpochDateStringWithSpaces(t *testing.T) {
	tm, err := parseEpochDateString("2024-06-11 15:04:05")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if tm.Year() != 2024 || tm.Month() != 6 || tm.Day() != 11 {
		t.Errorf("unexpected date: %v", tm)
	}
}

func TestParseEpochDateStringInvalid(t *testing.T) {
	_, err := parseEpochDateString("not-a-date")
	if err == nil {
		t.Fatal("expected error for invalid date string")
	}
}

func TestParseEpochRelativeHoursAgo(t *testing.T) {
	tm, err := parseEpochRelative("2 hours ago")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	expected := time.Now().Add(-2 * time.Hour)
	diff := tm.Sub(expected)
	if diff < -time.Second || diff > time.Second {
		t.Errorf("expected ~2 hours ago, diff: %v", diff)
	}
}

func TestParseEpochRelativePlusDays(t *testing.T) {
	tm, err := parseEpochRelative("+3 days")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	expected := time.Now().Add(3 * 24 * time.Hour)
	diff := tm.Sub(expected)
	if diff < -time.Second || diff > time.Second {
		t.Errorf("expected ~+3 days, diff: %v", diff)
	}
}

func TestParseEpochRelativeMinusWeek(t *testing.T) {
	tm, err := parseEpochRelative("-1 week")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	expected := time.Now().Add(-7 * 24 * time.Hour)
	diff := tm.Sub(expected)
	if diff < -time.Second || diff > time.Second {
		t.Errorf("expected ~-1 week, diff: %v", diff)
	}
}

func TestParseEpochRelativeInvalid(t *testing.T) {
	_, err := parseEpochRelative("foo")
	if err == nil {
		t.Fatal("expected error for invalid relative time")
	}
}

func TestParseEpochRelativeUnknownUnit(t *testing.T) {
	_, err := parseEpochRelative("5 decades ago")
	if err == nil {
		t.Fatal("expected error for unknown unit")
	}
}

func TestPrintEpochJSON(t *testing.T) {
	out := captureOutput(func() {
		printEpochJSON(1718100000, "2024-06-11T15:00:00Z")
	})
	var result map[string]interface{}
	if err := json.Unmarshal([]byte(out), &result); err != nil {
		t.Fatalf("invalid JSON output: %v\noutput: %s", err, out)
	}
	if result["epoch"] != float64(1718100000) {
		t.Errorf("expected epoch 1718100000, got %v", result["epoch"])
	}
	if result["rfc3339"] != "2024-06-11T15:00:00Z" {
		t.Errorf("expected rfc3339 '2024-06-11T15:00:00Z', got %v", result["rfc3339"])
	}
}

func TestParseEpochRelativeMinutesAgo(t *testing.T) {
	tm, err := parseEpochRelative("30 minutes ago")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	expected := time.Now().Add(-30 * time.Minute)
	diff := tm.Sub(expected)
	if diff < -time.Second || diff > time.Second {
		t.Errorf("expected ~30 minutes ago, diff: %v", diff)
	}
}

func TestParseEpochRelativeMonths(t *testing.T) {
	tm, err := parseEpochRelative("+1 month")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	expected := time.Now().Add(30 * 24 * time.Hour)
	diff := tm.Sub(expected)
	if diff < -time.Second || diff > time.Second {
		t.Errorf("expected ~+1 month, diff: %v", diff)
	}
}

func TestParseEpochRelativeYears(t *testing.T) {
	tm, err := parseEpochRelative("-1 year")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	expected := time.Now().Add(-365 * 24 * time.Hour)
	diff := tm.Sub(expected)
	if diff < -time.Second || diff > time.Second {
		t.Errorf("expected ~-1 year, diff: %v", diff)
	}
}

func TestParseEpochDateStringRFC1123(t *testing.T) {
	tm, err := parseEpochDateString("Mon, 11 Jun 2024 15:04:05 UTC")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if tm.Year() != 2024 || tm.Month() != 6 || tm.Day() != 11 {
		t.Errorf("unexpected date: %v", tm)
	}
}

func TestParseEpochRelativeSecondsAgo(t *testing.T) {
	tm, err := parseEpochRelative("10 seconds ago")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	expected := time.Now().Add(-10 * time.Second)
	diff := tm.Sub(expected)
	if diff < -time.Second || diff > time.Second {
		t.Errorf("expected ~10 seconds ago, diff: %v", diff)
	}
}

func TestPrintEpochJSONTrailingNewline(t *testing.T) {
	out := captureOutput(func() {
		printEpochJSON(1000, "1970-01-01T00:16:40Z")
	})
	if !strings.HasSuffix(out, "\n") {
		t.Error("expected trailing newline in JSON output")
	}
}
