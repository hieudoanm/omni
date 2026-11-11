package shared

import (
	"fmt"
	"strings"
	"testing"
)

func TestCaptureOutput(t *testing.T) {
	got := CaptureOutput(func() {
		fmt.Print("hello world")
	})
	if got != "hello world" {
		t.Errorf("CaptureOutput = %q, want %q", got, "hello world")
	}
}

func TestCaptureOutput_empty(t *testing.T) {
	got := CaptureOutput(func() {})
	if got != "" {
		t.Errorf("CaptureOutput = %q, want empty", got)
	}
}

func TestCaptureOutput_multipleWrites(t *testing.T) {
	got := CaptureOutput(func() {
		fmt.Print("a")
		fmt.Print("b")
		fmt.Print("c")
	})
	if got != "abc" {
		t.Errorf("CaptureOutput = %q, want %q", got, "abc")
	}
}

func TestCaptureOutput_newlines(t *testing.T) {
	got := CaptureOutput(func() {
		fmt.Println("line1")
		fmt.Println("line2")
	})
	lines := strings.Split(strings.TrimSpace(got), "\n")
	if len(lines) != 2 || lines[0] != "line1" || lines[1] != "line2" {
		t.Errorf("CaptureOutput = %q, want two lines", got)
	}
}
