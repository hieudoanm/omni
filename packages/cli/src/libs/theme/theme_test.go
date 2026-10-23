package theme

import (
	"strings"
	"testing"
)

func TestStatusStyle(t *testing.T) {
	tests := []struct {
		name  string
		value float64
		want  string // expected rendered output contains this substring
	}{
		{name: "below 65 should be success", value: 0, want: ""},
		{name: "exactly 65 should be warning", value: 65, want: ""},
		{name: "between 65 and 85 should be warning", value: 75, want: ""},
		{name: "exactly 85 should be error", value: 85, want: ""},
		{name: "above 85 should be error", value: 90, want: ""},
		{name: "max value", value: 100, want: ""},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := StatusStyle(tt.value)
			rendered := got.Render("test")
			if !strings.HasPrefix(rendered, "\x1b[") {
				t.Errorf("StatusStyle(%v).Render() = %q, expected ANSI output", tt.value, rendered)
			}
		})
	}
}

func TestStatusStyle_edge_cases(t *testing.T) {
	// Just below boundary = success
	r1 := StatusStyle(64).Render("x")
	if !strings.Contains(r1, "x") {
		t.Error("expected content in render")
	}

	// Just above boundary = warning
	r2 := StatusStyle(66).Render("x")
	if !strings.Contains(r2, "x") {
		t.Error("expected content in render")
	}

	// Just below 85 = warning
	r3 := StatusStyle(84).Render("x")
	if !strings.Contains(r3, "x") {
		t.Error("expected content in render")
	}

	// Exactly 86 = error
	r4 := StatusStyle(86).Render("x")
	if !strings.Contains(r4, "x") {
		t.Error("expected content in render")
	}
}

func TestDotForStatus(t *testing.T) {
	tests := []struct {
		name   string
		status string
	}{
		{name: "up", status: "up"},
		{name: "ok", status: "ok"},
		{name: "healthy", status: "healthy"},
		{name: "down", status: "down"},
		{name: "error", status: "error"},
		{name: "critical", status: "critical"},
		{name: "unknown", status: "unknown"},
		{name: "empty string", status: ""},
		{name: "unrecognized", status: "maintenance"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := DotForStatus(tt.status)
			if !strings.HasPrefix(got, "\x1b[") {
				t.Errorf("DotForStatus(%q) = %q, expected ANSI output", tt.status, got)
			}
			// Should contain ●
			if !strings.Contains(got, "●") {
				t.Errorf("DotForStatus(%q) should contain a dot character, got %q", tt.status, got)
			}
		})
	}
}

func TestDotForStatus_up_variants(t *testing.T) {
	got := DotForStatus("up")
	// up, ok, healthy should all return ServerUp (same style)
	gotOk := DotForStatus("ok")
	if got != gotOk {
		t.Errorf("'up' and 'ok' should return same style, got %q vs %q", got, gotOk)
	}
}

func TestDotForStatus_down_variants(t *testing.T) {
	got := DotForStatus("down")
	gotErr := DotForStatus("error")
	if got != gotErr {
		t.Errorf("'down' and 'error' should return same style, got %q vs %q", got, gotErr)
	}
}

func TestDotForStatus_default_vs_known(t *testing.T) {
	// default/warn should be different from up and down
	def := DotForStatus("unknown")
	up := DotForStatus("up")
	down := DotForStatus("down")
	if def == up {
		t.Errorf("default (unknown) should differ from up")
	}
	if def == down {
		t.Errorf("default (unknown) should differ from down")
	}
}
