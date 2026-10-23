package net

import (
	"testing"

	"github.com/spf13/cobra"
)

func TestNewCommand(t *testing.T) {
	cmd := NewCommand()

	if cmd.Use != "net" {
		t.Errorf("expected Use='net', got %q", cmd.Use)
	}

	expected := []string{"cert", "ip", "ping", "serve", "status", "wifi", "http", "whois"}
	got := make(map[string]*cobra.Command)
	for _, c := range cmd.Commands() {
		got[c.Name()] = c
	}

	for _, name := range expected {
		if _, ok := got[name]; !ok {
			t.Errorf("expected subcommand %q not found", name)
		}
	}
}
