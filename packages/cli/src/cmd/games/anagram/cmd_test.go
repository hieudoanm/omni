package anagram

import (
	"testing"
)

func TestNewCommand(t *testing.T) {
	cmd := NewCommand()
	if cmd.Use != "anagram" {
		t.Errorf("NewCommand().Use = %q, want %q", cmd.Use, "anagram")
	}
	if cmd.Short == "" {
		t.Error("NewCommand().Short should not be empty")
	}
}
