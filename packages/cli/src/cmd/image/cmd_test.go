package image

import (
	"testing"
)

var allSubcommands = []string{
	"background",
	"blur",
	"border",
	"collage",
	"combine",
	"compress",
	"convert",
	"crop",
	"dominant",
	"flip",
	"grayscale",
	"icons",
	"info",
	"pixelate",
	"resize",
	"round",
	"sharpen",
	"split",
	"text",
}

func TestNewCommand(t *testing.T) {
	cmd := NewCommand()
	if cmd.Use != "image" {
		t.Errorf("Use = %q, want %q", cmd.Use, "image")
	}
}

func TestNewCommand_HasSubcommands(t *testing.T) {
	cmd := NewCommand()
	subs := cmd.Commands()
	names := make(map[string]bool)
	for _, c := range subs {
		names[c.Name()] = true
	}
	for _, want := range allSubcommands {
		if !names[want] {
			t.Errorf("missing subcommand: %s", want)
		}
	}
}
