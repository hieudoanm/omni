package disk

import (
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/system/disk/internal"
)

func TestDiskLabel(t *testing.T) {
	tests := []struct {
		bytes uint64
		want  string
	}{
		{0, "0 B"},
		{500, "500 B"},
		{1024, "1.0 KB"},
		{1536, "1.5 KB"},
		{1048576, "1.0 MB"},
		{1073741824, "1.0 GB"},
	}

	for _, tt := range tests {
		got := internal.DiskLabel(tt.bytes)
		if got != tt.want {
			t.Errorf("DiskLabel(%d) = %q, want %q", tt.bytes, got, tt.want)
		}
	}
}

func TestToLower(t *testing.T) {
	tests := []struct {
		b    byte
		want byte
	}{
		{'A', 'a'},
		{'Z', 'z'},
		{'a', 'a'},
		{'z', 'z'},
		{'0', '0'},
		{' ', ' '},
	}
	for _, tt := range tests {
		got := toLower(tt.b)
		if got != tt.want {
			t.Errorf("toLower(%q) = %q, want %q", tt.b, got, tt.want)
		}
	}
}

func TestContainsIgnoreCase(t *testing.T) {
	tests := []struct {
		s, substr string
		want      bool
	}{
		{"hello world", "world", true},
		{"hello world", "WORLD", true},
		{"Hello World", "hello", true},
		{"hello world", "xyz", false},
		{"hello", "", true},
		{"ab", "abc", false},
		{"HELLO", "hello", true},
	}
	for _, tt := range tests {
		got := containsIgnoreCase(tt.s, tt.substr)
		if got != tt.want {
			t.Errorf("containsIgnoreCase(%q, %q) = %v, want %v", tt.s, tt.substr, got, tt.want)
		}
	}
}

func TestContainsFold(t *testing.T) {
	if !containsFold("Hello World", "world") {
		t.Error("containsFold should be case-insensitive")
	}
	if containsFold("Hello World", "xyz") {
		t.Error("containsFold should return false for non-matching strings")
	}
}
