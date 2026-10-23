package convert

import (
	"testing"
)

func TestNewCommand_Structure(t *testing.T) {
	cmd := NewCommand()
	if cmd.Use != "convert" {
		t.Errorf("Use = %q, want %q", cmd.Use, "convert")
	}
	if cmd.Short != "Text conversion utilities" {
		t.Errorf("Short = %q, want %q", cmd.Short, "Text conversion utilities")
	}
	if cmd.Flag("json") == nil {
		t.Error("expected --json persistent flag")
	}
}

func TestNewCommand_HasAllSubcommands(t *testing.T) {
	cmd := NewCommand()
	names := make(map[string]bool)
	for _, sub := range cmd.Commands() {
		names[sub.Name()] = true
	}
	expected := []string{
		"braille", "morse", "base64", "url", "capitalise", "deburr",
		"kebabcase", "camelcase", "lorem", "pascalcase", "slug",
		"lowercase", "snakecase", "uppercase", "count",
	}
	for _, name := range expected {
		if !names[name] {
			t.Errorf("missing subcommand: %s", name)
		}
	}
	if len(cmd.Commands()) != len(expected) {
		t.Errorf("expected %d subcommands, got %d", len(expected), len(cmd.Commands()))
	}
}

func TestNewCommand_SubcommandUseMatches(t *testing.T) {
	cmd := NewCommand()
	expectations := map[string]string{
		"braille":    "braille <text>",
		"morse":      "morse <text>",
		"base64":     "base64",
		"url":        "url [text]",
		"capitalise": "capitalise <text>",
		"deburr":     "deburr <text>",
		"kebabcase":  "kebabcase <text>",
		"lorem":      "lorem",
		"camelcase":  "camelcase <text>",
		"pascalcase": "pascalcase <text>",
		"slug":       "slug <text>",
		"lowercase":  "lowercase <text>",
		"snakecase":  "snakecase <text>",
		"uppercase":  "uppercase <text>",
		"count":      "count <text>",
	}
	for _, sub := range cmd.Commands() {
		expected, ok := expectations[sub.Name()]
		if !ok {
			continue
		}
		if sub.Use != expected {
			t.Errorf("%s.Use = %q, want %q", sub.Name(), sub.Use, expected)
		}
	}
}
