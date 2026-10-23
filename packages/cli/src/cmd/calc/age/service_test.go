package age

import (
	"bytes"
	"encoding/json"
	"fmt"
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

func TestCalcAge(t *testing.T) {
	now := time.Now()
	cy, cm, cd := now.Date()

	tests := []struct {
		name         string
		by, bm, bd   int
		wantY, wantM int
		wantD        int
	}{
		{
			name:  "exact birthday",
			by:    cy - 30,
			bm:    int(cm),
			bd:    cd,
			wantY: 30,
			wantM: 0,
			wantD: 0,
		},
		{
			name:  "one month before birthday",
			by:    cy - 25,
			bm:    int(cm) + 1,
			bd:    cd,
			wantY: 24,
			wantM: 11,
			wantD: 0,
		},
		{
			name:  "one day before birthday",
			by:    cy - 40,
			bm:    int(cm),
			bd:    cd + 1,
			wantY: 39,
			wantM: 11,
		},
	}

	if tests[2].bd > daysInMonth(cy, int(cm)) {
		tests[2].bd = 1
		bm := int(cm) + 1
		if bm > 12 {
			bm = 1
		}
		tests[2].bm = bm
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			gotY, gotM, gotD := calcAge(tt.by, tt.bm, tt.bd)

			if gotY != tt.wantY || gotM != tt.wantM {
				t.Errorf("calcAge(%d,%d,%d) = (%d,%d,%d), want (%d,%d,%d)",
					tt.by, tt.bm, tt.bd, gotY, gotM, gotD, tt.wantY, tt.wantM, tt.wantD)
			}

			if tt.wantD != 0 && gotD != tt.wantD {
				t.Errorf("calcAge(%d,%d,%d) days = %d, want %d",
					tt.by, tt.bm, tt.bd, gotD, tt.wantD)
			}
		})
	}
}

func TestInvalidDates(t *testing.T) {
	tests := []struct {
		y, m, d int
	}{
		{2001, 2, 31},
		{2023, 4, 31},
		{2025, 2, 29},
		{2023, 13, 1},
		{2023, 0, 1},
		{2023, 1, 0},
		{2023, 1, 32},
	}
	for _, tt := range tests {
		birth := time.Date(tt.y, time.Month(tt.m), tt.d, 0, 0, 0, 0, time.UTC)
		if birth.Year() == tt.y && birth.Month() == time.Month(tt.m) && birth.Day() == tt.d {
			t.Errorf("date %04d/%02d/%02d should be invalid but was accepted", tt.y, tt.m, tt.d)
		}
	}
}

func TestDaysInMonth(t *testing.T) {
	tests := []struct {
		y, m int
		want int
	}{
		{2024, 1, 29},
		{2025, 1, 28},
		{2025, 0, 31},
		{2025, 11, 31},
	}
	for _, tt := range tests {
		if got := daysInMonth(tt.y, tt.m); got != tt.want {
			t.Errorf("daysInMonth(%d,%d) = %d, want %d", tt.y, tt.m, got, tt.want)
		}
	}
}

func TestRunAge_ValidDate(t *testing.T) {
	now := time.Now()
	output := captureOutput(func() {
		if err := runAge(now.Year()-30, int(now.Month()), now.Day(), false); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "Age:") {
		t.Errorf("expected Age: in output, got %q", output)
	}
}

func TestRunAge_FutureDate(t *testing.T) {
	err := runAge(2099, 1, 1, false)
	if err == nil || !strings.Contains(err.Error(), "future") {
		t.Errorf("expected future date error, got %v", err)
	}
}

func TestRunAge_MissingFlags(t *testing.T) {
	err := runAge(0, 0, 0, false)
	if err == nil || !strings.Contains(err.Error(), "required") {
		t.Errorf("expected required error, got %v", err)
	}
}

func TestRunAge_InvalidMonth(t *testing.T) {
	err := runAge(1990, 13, 1, false)
	if err == nil || !strings.Contains(err.Error(), "month must be between 1 and 12") {
		t.Errorf("expected invalid month error, got %v", err)
	}
}

func TestRunAge_InvalidDay(t *testing.T) {
	err := runAge(1990, 1, 32, false)
	if err == nil || !strings.Contains(err.Error(), "day must be between 1 and 31") {
		t.Errorf("expected invalid day error, got %v", err)
	}
}

func TestRunAge_Json(t *testing.T) {
	output := captureOutput(func() {
		if err := runAge(1990, 1, 15, true); err != nil {
			t.Fatal(err)
		}
	})
	var result map[string]interface{}
	if err := json.Unmarshal([]byte(strings.TrimSpace(output)), &result); err != nil {
		t.Fatalf("invalid json output: %v", err)
	}
	if result["birth_date"] != "1990-01-15" {
		t.Errorf("expected birth_date 1990-01-15, got %v", result["birth_date"])
	}
}

func TestCmd_RunE_ValidDate(t *testing.T) {
	now := time.Now()
	cmd := NewCmd()
	cmd.Flags().Set("year", fmt.Sprintf("%d", now.Year()-30))
	cmd.Flags().Set("month", fmt.Sprintf("%d", now.Month()))
	cmd.Flags().Set("day", fmt.Sprintf("%d", now.Day()))
	output := captureOutput(func() {
		if err := cmd.RunE(cmd, []string{}); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "Age:") {
		t.Errorf("expected Age: in output, got %q", output)
	}
}
