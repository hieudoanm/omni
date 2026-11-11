package env

import (
	"testing"
)

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "env [key]" {
		t.Errorf("Use = %q", cmd.Use)
	}
	if cmd.Short != "List or search environment variables" {
		t.Errorf("Short = %q", cmd.Short)
	}
	wantLong := "Display all environment variables, or filter by key prefix."
	if cmd.Long != wantLong {
		t.Errorf("Long = %q, want %q", cmd.Long, wantLong)
	}
	wantExample := "  system env\n  system env PATH\n  system env HOME\n  system env --sort\n  system env --json"
	if cmd.Example != wantExample {
		t.Errorf("Example = %q, want %q", cmd.Example, wantExample)
	}
	for _, name := range []string{"sort", "json"} {
		if cmd.Flag(name) == nil {
			t.Errorf("missing flag: --%s", name)
		}
	}
}
