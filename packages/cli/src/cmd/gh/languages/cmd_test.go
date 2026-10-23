package languages

import (
	"testing"
)

func TestNewCommand_Structure(t *testing.T) {
	cmd := NewCommand()
	if cmd.Use != "languages [--repo <owner/repo>]" {
		t.Errorf("Use = %q, want 'languages [--repo <owner/repo>]'", cmd.Use)
	}
	if cmd.Short != "Show repository language breakdown and generate SVG bar chart" {
		t.Errorf("Short = %q, want 'Show repository language breakdown and generate SVG bar chart'", cmd.Short)
	}
	wantLong := `Fetches language statistics for a GitHub repository and generates
an SVG bar chart showing the breakdown.`
	if cmd.Long != wantLong {
		t.Errorf("Long = %q, want %q", cmd.Long, wantLong)
	}
	wantExample := `  gh languages --repo hieudoanm/hieudoanm.github.io
  gh languages --repo hieudoanm/hieudoanm --output lang.svg`
	if cmd.Example != wantExample {
		t.Errorf("Example = %q, want %q", cmd.Example, wantExample)
	}
	if f := cmd.Flags().Lookup("repo"); f == nil {
		t.Error("expected --repo flag")
	} else if f.DefValue != "" {
		t.Errorf("--repo default = %q, want ''", f.DefValue)
	}
	if f := cmd.Flags().Lookup("output"); f == nil {
		t.Error("expected --output flag")
	} else if f.DefValue != "languages.svg" {
		t.Errorf("--output default = %q, want 'languages.svg'", f.DefValue)
	}
}
