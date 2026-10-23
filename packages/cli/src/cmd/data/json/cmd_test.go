package json

import (
	"testing"
)

func TestNewCmdFlags(t *testing.T) {
	cmd := NewCmd()
	if cmd == nil {
		t.Fatal("NewCmd() returned nil")
	}

	expectedFlags := map[string]struct {
		short string
		long  string
	}{
		"query": {short: "q", long: "query"},
		"diff":  {short: "", long: "diff"},
		"merge": {short: "", long: "merge"},
	}

	for name, expected := range expectedFlags {
		flag := cmd.Flag(name)
		if flag == nil {
			t.Errorf("missing flag: --%s", name)
			continue
		}
		if flag.Shorthand != expected.short {
			t.Errorf("flag %s shorthand = %q, want %q", name, flag.Shorthand, expected.short)
		}
	}
}

func TestNewCmdMetadata(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "json [file]" {
		t.Errorf("Use = %q, want %q", cmd.Use, "json [file]")
	}
	if cmd.Short == "" {
		t.Error("Short description should not be empty")
	}
	if cmd.Long == "" {
		t.Error("Long description should not be empty")
	}
	if cmd.Example == "" {
		t.Error("Example should not be empty")
	}
}

func TestNewCmdArgs(t *testing.T) {
	cmd := NewCmd()
	if cmd.Args == nil {
		t.Fatal("expected Args validator")
	}
	if err := cmd.Args(cmd, []string{}); err != nil {
		t.Errorf("expected no error for 0 args, got: %v", err)
	}
	if err := cmd.Args(cmd, []string{"a.json"}); err != nil {
		t.Errorf("expected no error for 1 arg, got: %v", err)
	}
	if err := cmd.Args(cmd, []string{"a.json", "b.json"}); err != nil {
		t.Errorf("expected no error for 2 args, got: %v", err)
	}
	if err := cmd.Args(cmd, []string{"a", "b", "c"}); err == nil {
		t.Error("expected error for 3 args")
	}
}
