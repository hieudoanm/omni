package timer

import (
	"bytes"
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

func TestRunTimer(t *testing.T) {
	output := captureOutput(func() {
		if err := runTimer("2s", false); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "Time's up!") {
		t.Errorf("expected Time's up, got: %s", output)
	}
}

func TestRunTimer_JSON(t *testing.T) {
	output := captureOutput(func() {
		if err := runTimer("2s", true); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "completed") {
		t.Errorf("expected JSON completed status, got: %s", output)
	}
}

func TestRunTimer_Cancelled(t *testing.T) {
	go func() {
		time.Sleep(50 * time.Millisecond)
		p, _ := os.FindProcess(os.Getpid())
		p.Signal(os.Interrupt)
	}()
	output := captureOutput(func() {
		if err := runTimer("10s", false); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "Timer cancelled") {
		t.Errorf("expected cancelled message, got: %s", output)
	}
}

func TestRunTimer_CancelledJSON(t *testing.T) {
	go func() {
		time.Sleep(50 * time.Millisecond)
		p, _ := os.FindProcess(os.Getpid())
		p.Signal(os.Interrupt)
	}()
	output := captureOutput(func() {
		if err := runTimer("10s", true); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "cancelled") {
		t.Errorf("expected cancelled status, got: %s", output)
	}
}

func TestNewCmd_RunE(t *testing.T) {
	output := captureOutput(func() {
		cmd := NewCmd()
		cmd.SetArgs([]string{"--duration", "1s"})
		if err := cmd.Execute(); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "Time's up") {
		t.Errorf("expected Time's up, got: %s", output)
	}
}

func TestNewCmd_RunE_JSON(t *testing.T) {
	output := captureOutput(func() {
		cmd := NewCmd()
		cmd.SetArgs([]string{"--duration", "1s", "--json"})
		if err := cmd.Execute(); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "completed") {
		t.Errorf("expected completed status, got: %s", output)
	}
}

func TestRunTimer_InvalidDuration(t *testing.T) {
	err := runTimer("invalid", false)
	if err == nil {
		t.Fatal("expected error for invalid duration")
	}
}

func TestParseTimerDurationSeconds(t *testing.T) {
	d, err := parseTimerDuration("30s")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if d != 30*time.Second {
		t.Errorf("expected 30s, got %v", d)
	}
}

func TestParseTimerDurationMinutes(t *testing.T) {
	d, err := parseTimerDuration("5m")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if d != 5*time.Minute {
		t.Errorf("expected 5m, got %v", d)
	}
}

func TestParseTimerDurationBareNumber(t *testing.T) {
	d, err := parseTimerDuration("90")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if d != 90*time.Second {
		t.Errorf("expected 90s, got %v", d)
	}
}

func TestParseTimerDurationHours(t *testing.T) {
	d, err := parseTimerDuration("2h")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if d != 2*time.Hour {
		t.Errorf("expected 2h, got %v", d)
	}
}

func TestParseTimerDurationEmpty(t *testing.T) {
	_, err := parseTimerDuration("")
	if err == nil {
		t.Fatal("expected error for empty string")
	}
}

func TestParseTimerDurationInvalid(t *testing.T) {
	_, err := parseTimerDuration("abc")
	if err == nil {
		t.Fatal("expected error for invalid input")
	}
}

func TestParseTimerDurationInvalidSuffix(t *testing.T) {
	_, err := parseTimerDuration("10x")
	if err == nil {
		t.Fatal("expected error for invalid suffix")
	}
}

func TestParseTimerDurationInvalidHours(t *testing.T) {
	_, err := parseTimerDuration("xh")
	if err == nil {
		t.Fatal("expected error for invalid hours")
	}
}

func TestFormatTimerDurationZero(t *testing.T) {
	got := formatTimerDuration(0)
	if got != "00:00" {
		t.Errorf("expected '00:00', got %q", got)
	}
}

func TestFormatTimerDurationSeconds(t *testing.T) {
	got := formatTimerDuration(45 * time.Second)
	if got != "00:45" {
		t.Errorf("expected '00:45', got %q", got)
	}
}

func TestFormatTimerDurationMinutes(t *testing.T) {
	got := formatTimerDuration(5*time.Minute + 30*time.Second)
	if got != "05:30" {
		t.Errorf("expected '05:30', got %q", got)
	}
}

func TestFormatTimerDurationHours(t *testing.T) {
	got := formatTimerDuration(90*time.Minute + 15*time.Second)
	if got != "90:15" {
		t.Errorf("expected '90:15', got %q", got)
	}
}

func TestFormatTimerDurationRoundsDown(t *testing.T) {
	got := formatTimerDuration(61*time.Second + 500*time.Millisecond)
	if got != "01:01" {
		t.Errorf("expected '01:01' (rounded), got %q", got)
	}
}
