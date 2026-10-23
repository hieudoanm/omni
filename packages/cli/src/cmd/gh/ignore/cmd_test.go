package ignore

import (
	"testing"
)

func TestNewCommand_Structure(t *testing.T) {
	cmd := NewCommand()
	if cmd.Use != "ignore" {
		t.Errorf("Use = %q, want 'ignore'", cmd.Use)
	}
	if cmd.Short != "Fetch a .gitignore template from GitHub" {
		t.Errorf("Short = %q, want 'Fetch a .gitignore template from GitHub'", cmd.Short)
	}
	wantLong := `Fetch and save a .gitignore template from the GitHub gitignore API.

Fetches the list of available templates, prompts the user to select
one (or uses --name), then writes the template content to a file.`
	if cmd.Long != wantLong {
		t.Errorf("Long = %q, want %q", cmd.Long, wantLong)
	}
	wantExample := `  gh ignore
  gh ignore --name Go
  gh ignore --name Python -o .gitignore`
	if cmd.Example != wantExample {
		t.Errorf("Example = %q, want %q", cmd.Example, wantExample)
	}
	if f := cmd.Flags().Lookup("name"); f == nil {
		t.Error("expected --name flag")
	} else if f.DefValue != "" {
		t.Errorf("--name default = %q, want ''", f.DefValue)
	}
	if f := cmd.Flags().Lookup("output"); f == nil {
		t.Error("expected --output flag")
	} else if f.DefValue != ".gitignore" {
		t.Errorf("--output default = %q, want '.gitignore'", f.DefValue)
	}
}
