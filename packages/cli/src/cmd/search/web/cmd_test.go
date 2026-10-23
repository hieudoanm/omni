package web

import (
	"strings"
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/search/shared"
)

func TestNewCmd_Structure(t *testing.T) {
	cmd := NewCommand()
	if cmd.Use != "web [--query <query>]" {
		t.Errorf("Use = %q", cmd.Use)
	}
	if cmd.Short != "Search the internet" {
		t.Errorf("Short = %q", cmd.Short)
	}
	if f := cmd.Flags().Lookup("query"); f == nil {
		t.Error("expected --query flag")
	}
	if f := cmd.Flags().Lookup("max-results"); f == nil {
		t.Error("expected --max-results flag")
	}
	if f := cmd.Flags().Lookup("source"); f == nil {
		t.Error("expected --source flag")
	}
}

func TestNewCommandUnsupportedSource(t *testing.T) {
	cmd := NewCommand()
	cmd.SetArgs([]string{"--query", "test", "--source", "google"})

	err := cmd.Execute()
	if err == nil {
		t.Fatal("expected error for unsupported source")
	}
	if !strings.Contains(err.Error(), "unsupported search source") {
		t.Errorf("unexpected error: %v", err)
	}
}

func TestNewCommandDefaultSource(t *testing.T) {
	cmd := NewCommand()
	cmd.SetArgs([]string{"--query", "test", "--source", "duckduckgo"})

	output := shared.CaptureOutput(func() {
		err := cmd.Execute()
		if err != nil {
			t.Logf("expected duckduckgo call may fail in tests: %v", err)
		}
	})

	if output != "" && !strings.Contains(output, "no results") && !strings.Contains(output, "results from DuckDuckGo") {
		t.Errorf("unexpected output: %s", output)
	}
}
