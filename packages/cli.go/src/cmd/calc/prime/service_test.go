package prime

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

func TestIsPrime(t *testing.T) {
	tests := []struct {
		n    int64
		want bool
	}{
		{-1, false},
		{0, false},
		{1, false},
		{2, true},
		{3, true},
		{4, false},
		{5, true},
		{17, true},
		{18, false},
		{19, true},
		{9, false},
		{15, false},
		{21, false},
		{25, false},
		{97, true},
		{100, false},
		{7919, true},
	}
	for _, tt := range tests {
		if got := isPrime(tt.n); got != tt.want {
			t.Errorf("isPrime(%d) = %v, want %v", tt.n, got, tt.want)
		}
	}
}

func TestSieve(t *testing.T) {
	if got := sieve(1); got != nil {
		t.Errorf("sieve(1) = %v, want nil", got)
	}
	if got := sieve(2); len(got) != 1 || got[0] != 2 {
		t.Errorf("sieve(2) = %v, want [2]", got)
	}
	primes := sieve(30)
	expected := []int64{2, 3, 5, 7, 11, 13, 17, 19, 23, 29}
	if len(primes) != len(expected) {
		t.Fatalf("sieve(30) = %v, want %v", primes, expected)
	}
	for i := range expected {
		if primes[i] != expected[i] {
			t.Errorf("sieve(30)[%d] = %d, want %d", i, primes[i], expected[i])
		}
	}
}

func TestCmd_RunE_IsPrime(t *testing.T) {
	cmd := NewCmd()
	cmd.Flags().Set("number", "17")
	output := captureOutput(func() {
		if err := cmd.RunE(cmd, []string{}); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "is prime") {
		t.Errorf("expected 'is prime' in output, got %q", output)
	}
}

func TestCmd_RunE_NotPrime(t *testing.T) {
	cmd := NewCmd()
	cmd.Flags().Set("number", "16")
	output := captureOutput(func() {
		if err := cmd.RunE(cmd, []string{}); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "is not prime") {
		t.Errorf("expected 'is not prime' in output, got %q", output)
	}
}

func TestCmd_RunE_InvalidNumber(t *testing.T) {
	cmd := NewCmd()
	cmd.Flags().Set("number", "1")
	err := cmd.RunE(cmd, []string{})
	if err == nil {
		t.Fatal("expected error for number < 2")
	}
}

func TestCmd_RunE_List(t *testing.T) {
	cmd := NewCmd()
	cmd.Flags().Set("number", "10")
	cmd.Flags().Set("list", "true")
	output := captureOutput(func() {
		if err := cmd.RunE(cmd, []string{}); err != nil {
			t.Fatal(err)
		}
	})
	lines := strings.Split(strings.TrimSpace(output), "\n")
	if len(lines) < 4 {
		t.Errorf("expected at least 4 primes up to 10, got %d", len(lines))
	}
}

func TestCmd_RunE_Json(t *testing.T) {
	cmd := NewCmd()
	cmd.Flags().Set("number", "17")
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
	if result["is_prime"] != true {
		t.Errorf("expected is_prime true, got %v", result["is_prime"])
	}
}
