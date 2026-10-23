package edit

import (
	"strings"
	"testing"
)

func TestPluralS(t *testing.T) {
	tests := []struct {
		n    int
		want string
	}{
		{0, "s"},
		{1, ""},
		{2, "s"},
		{100, "s"},
	}
	for _, tc := range tests {
		got := pluralS(tc.n)
		if got != tc.want {
			t.Errorf("pluralS(%d) = %q, want %q", tc.n, got, tc.want)
		}
	}
}

func TestShowDiff(t *testing.T) {
	before := "line1\nline2\nline3"
	after := "line1\nchanged\nline3"
	output := captureOutput(func() {
		showDiff(before, after)
	})
	if !strings.Contains(output, "- line2") {
		t.Errorf("expected '- line2' in output, got: %s", output)
	}
	if !strings.Contains(output, "+ changed") {
		t.Errorf("expected '+ changed' in output, got: %s", output)
	}
}

func TestShowDiffNoChanges(t *testing.T) {
	content := "same\nsame"
	output := captureOutput(func() {
		showDiff(content, content)
	})
	if !strings.Contains(output, "same") {
		t.Errorf("expected content in output, got: %s", output)
	}
	if strings.Contains(output, "- ") {
		t.Errorf("unexpected diff markers: %s", output)
	}
}

func TestShowDiffExtraLine(t *testing.T) {
	before := "line1\nline2"
	after := "line1\nline2\nline3"
	output := captureOutput(func() {
		showDiff(before, after)
	})
	if !strings.Contains(output, "+ line3") {
		t.Errorf("expected '+ line3' in output, got: %s", output)
	}
}

func TestShowDiffRemovedLine(t *testing.T) {
	before := "line1\nline2\nline3"
	after := "line1\nline3"
	output := captureOutput(func() {
		showDiff(before, after)
	})
	if !strings.Contains(output, "- line2") {
		t.Errorf("expected '- line2' in output, got: %s", output)
	}
}

func TestBuildDiff(t *testing.T) {
	tests := []struct {
		before string
		after  string
		want   string
	}{
		{"foo\nbar\nbaz", "foo\nqux\nbaz", "- bar\n+ qux"},
		{"same\nsame", "same\nsame", ""},
		{"line1\nline2", "line1\nchanged\nline2", "- line2\n+ changed\n+ line2"},
		{"removed", "", "- removed"},
		{"", "added", "+ added"},
		{"only", "only", ""},
		{"a\nb\nc", "a\nb\nc\nd", "+ d"},
		{"a\nb\nc\nd", "a\nb\nc", "- d"},
	}
	for _, tc := range tests {
		got := buildDiff(tc.before, tc.after)
		if got != tc.want {
			t.Errorf("buildDiff(%q, %q) = %q, want %q", tc.before, tc.after, got, tc.want)
		}
	}
}
