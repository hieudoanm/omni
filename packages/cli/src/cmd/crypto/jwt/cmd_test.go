package jwt

import "testing"

func TestNewCommand_Use(t *testing.T) {
	cmd := NewCommand()
	if cmd.Use != "jwt" {
		t.Errorf("got Use %q, want %q", cmd.Use, "jwt")
	}
	if cmd.Short != "Encode and decode JWTs" {
		t.Errorf("got Short %q, want %q", cmd.Short, "Encode and decode JWTs")
	}
}

func TestNewCommand_RunE(t *testing.T) {
	cmd := NewCommand()
	err := cmd.RunE(cmd, []string{})
	if err != nil {
		t.Fatal(err)
	}
}

func TestNewCommand_hasSubcommands(t *testing.T) {
	cmd := NewCommand()
	want := []string{"decode", "encode"}
	got := cmd.Commands()
	if len(got) != len(want) {
		t.Fatalf("got %d subcommands, want %d", len(got), len(want))
	}
	names := make(map[string]bool)
	for _, c := range got {
		names[c.Name()] = true
	}
	for _, name := range want {
		if !names[name] {
			t.Errorf("missing subcommand: %s", name)
		}
	}
}
