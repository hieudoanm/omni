package semver

import (
	"testing"
)

func TestNewCommandHasSubcommands(t *testing.T) {
	cmd := NewCommand()
	names := make(map[string]bool)
	for _, c := range cmd.Commands() {
		names[c.Name()] = true
	}
	for _, want := range []string{"validate", "compare", "sort"} {
		if !names[want] {
			t.Errorf("missing subcommand: %s", want)
		}
	}
}

func TestNewCommandSubcommandCount(t *testing.T) {
	cmd := NewCommand()
	if n := len(cmd.Commands()); n != 3 {
		t.Errorf("expected 3 subcommands, got %d", n)
	}
}

func TestNewCommandHasFlags(t *testing.T) {
	cmd := NewCommand()
	for _, name := range []string{"bump", "prerelease", "range", "version"} {
		if _, err := cmd.Flags().GetString(name); err != nil {
			t.Errorf("missing flag: --%s", name)
		}
	}
	if _, err := cmd.PersistentFlags().GetBool("json"); err != nil {
		t.Error("missing persistent flag: --json")
	}
}

func TestNewCommandBumpMajor(t *testing.T) {
	cmd := NewCommand()
	cmd.SetArgs([]string{"--bump", "major", "--version", "1.2.3"})
	if err := cmd.Execute(); err != nil {
		t.Fatal(err)
	}
}

func TestNewCommandBumpMinor(t *testing.T) {
	cmd := NewCommand()
	cmd.SetArgs([]string{"--bump", "minor", "--version", "1.2.3"})
	if err := cmd.Execute(); err != nil {
		t.Fatal(err)
	}
}

func TestNewCommandBumpPatch(t *testing.T) {
	cmd := NewCommand()
	cmd.SetArgs([]string{"--bump", "patch", "--version", "1.2.3"})
	if err := cmd.Execute(); err != nil {
		t.Fatal(err)
	}
}

func TestNewCommandBumpWithPrerelease(t *testing.T) {
	cmd := NewCommand()
	cmd.SetArgs([]string{"--bump", "patch", "--prerelease", "alpha", "--version", "1.2.3"})
	if err := cmd.Execute(); err != nil {
		t.Fatal(err)
	}
}

func TestNewCommandBumpJSON(t *testing.T) {
	cmd := NewCommand()
	cmd.SetArgs([]string{"--bump", "patch", "--version", "1.2.3", "--json"})
	if err := cmd.Execute(); err != nil {
		t.Fatal(err)
	}
}

func TestNewCommandBumpInvalidPart(t *testing.T) {
	cmd := NewCommand()
	cmd.SetArgs([]string{"--bump", "invalid", "--version", "1.2.3"})
	if err := cmd.Execute(); err != nil {
		t.Fatal(err)
	}
}

func TestNewCommandBumpNoVersion(t *testing.T) {
	cmd := NewCommand()
	cmd.SetArgs([]string{"--bump", "patch"})
	if err := cmd.Execute(); err == nil {
		t.Error("expected error when --bump is set without --version")
	}
}

func TestNewCommandRangeMatch(t *testing.T) {
	cmd := NewCommand()
	cmd.SetArgs([]string{"--range", ">= 1.0.0 < 2.0.0", "--version", "1.5.0"})
	if err := cmd.Execute(); err != nil {
		t.Fatal(err)
	}
}

func TestNewCommandRangeNoMatch(t *testing.T) {
	cmd := NewCommand()
	cmd.SetArgs([]string{"--range", ">= 2.0.0", "--version", "1.5.0"})
	if err := cmd.Execute(); err != nil {
		t.Fatal(err)
	}
}

func TestNewCommandRangeNoVersion(t *testing.T) {
	cmd := NewCommand()
	cmd.SetArgs([]string{"--range", ">= 1.0.0"})
	if err := cmd.Execute(); err == nil {
		t.Error("expected error when --range is set without --version")
	}
}

func TestNewCommandRangeJSON(t *testing.T) {
	cmd := NewCommand()
	cmd.SetArgs([]string{"--range", ">= 1.0.0", "--version", "1.5.0", "--json"})
	if err := cmd.Execute(); err != nil {
		t.Fatal(err)
	}
}
