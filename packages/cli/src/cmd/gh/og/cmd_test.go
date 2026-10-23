package og

import (
	"testing"
)

func TestNewCommand_Structure(t *testing.T) {
	cmd := NewCommand()
	if cmd.Use != "og [--url <owner/repo>]" {
		t.Errorf("Use = %q, want 'og [--url <owner/repo>]'", cmd.Use)
	}
	if cmd.Short != "Generate an Open Graph SVG for a GitHub repository" {
		t.Errorf("Short = %q, want 'Generate an Open Graph SVG for a GitHub repository'", cmd.Short)
	}
	wantLong := `Fetches repository metadata from GitHub and generates
a 1200×630 Open Graph SVG image (social preview card).`
	if cmd.Long != wantLong {
		t.Errorf("Long = %q, want %q", cmd.Long, wantLong)
	}
	wantExample := `  gh og --url hieudoanm/hieudoanm.github.io
  gh og --url hieudoanm/hieudoanm --output preview.svg`
	if cmd.Example != wantExample {
		t.Errorf("Example = %q, want %q", cmd.Example, wantExample)
	}
	if f := cmd.Flags().Lookup("url"); f == nil {
		t.Error("expected --url flag")
	} else if f.DefValue != "" {
		t.Errorf("--url default = %q, want ''", f.DefValue)
	}
	if f := cmd.Flags().Lookup("output"); f == nil {
		t.Error("expected --output flag")
	} else if f.DefValue != "og.svg" {
		t.Errorf("--output default = %q, want 'og.svg'", f.DefValue)
	}
}
