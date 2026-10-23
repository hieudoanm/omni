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

func TestRunAge(t *testing.T) {
	output := captureOutput(func() {
		if err := runAge("1990-01-15", false); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "years") {
		t.Errorf("expected output with years, got: %s", output)
	}
}

func TestRunAge_JSON(t *testing.T) {
	output := captureOutput(func() {
		if err := runAge("1990-01-15", true); err != nil {
			t.Fatal(err)
		}
	})
	var result map[string]interface{}
	if err := json.Unmarshal([]byte(output), &result); err != nil {
		t.Fatalf("invalid JSON: %v\noutput: %s", err, output)
	}
	if result["birthdate"] != "1990-01-15" {
		t.Errorf("expected birthdate '1990-01-15', got %v", result["birthdate"])
	}
	if _, ok := result["years"]; !ok {
		t.Error("expected years field")
	}
}

func TestRunAge_FutureDate(t *testing.T) {
	err := runAge("2099-01-01", false)
	if err == nil {
		t.Fatal("expected error for future date")
	}
}

func TestRunAge_DaysBorrow(t *testing.T) {
	nowYear, nowMonth, nowDay := time.Now().Date()
	birthDay := nowDay + 5
	if birthDay > 28 {
		birthDay = 1
	}
	birthMonth := int(nowMonth)
	birthYear := nowYear - 1
	dateStr := fmt.Sprintf("%04d-%02d-%02d", birthYear, birthMonth, birthDay)

	output := captureOutput(func() {
		if err := runAge(dateStr, false); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "years") {
		t.Errorf("expected age output, got: %s", output)
	}
}

func TestRunAge_MonthsBorrow(t *testing.T) {
	nowYear, nowMonth, _ := time.Now().Date()
	birthMonth := int(nowMonth) + 3
	if birthMonth > 12 {
		birthMonth = birthMonth - 12
	}
	dateStr := fmt.Sprintf("%04d-%02d-01", nowYear-1, birthMonth)

	output := captureOutput(func() {
		if err := runAge(dateStr, false); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "years") {
		t.Errorf("expected age output, got: %s", output)
	}
}

func TestRunAge_InvalidDateFormat(t *testing.T) {
	err := runAge("not-a-date", false)
	if err == nil {
		t.Fatal("expected error for invalid date")
	}
	if !strings.Contains(err.Error(), "invalid date") {
		t.Errorf("expected invalid date error, got: %v", err)
	}
}
