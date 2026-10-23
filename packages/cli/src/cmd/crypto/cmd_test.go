package crypto

import (
	"testing"
)

func TestNewCommand(t *testing.T) {
	cmd := NewCommand()
	if cmd.Use != "crypto" {
		t.Errorf("got Use %q, want %q", cmd.Use, "crypto")
	}
	if cmd.Short != "Cryptographic and security tools" {
		t.Errorf("got Short %q, want %q", cmd.Short, "Cryptographic and security tools")
	}
}

func TestNewCommand_hasAllSubcommands(t *testing.T) {
	cmd := NewCommand()
	want := []string{"barcode", "hash", "jwt", "keygen", "passwd", "uuid", "qrcode", "encrypt", "decrypt", "totp"}
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

func TestNewCommand_hasPersistentFlags(t *testing.T) {
	cmd := NewCommand()
	f := cmd.PersistentFlags().Lookup("json")
	if f == nil {
		t.Fatal("missing persistent flag: json")
	}
	if f.DefValue != "false" {
		t.Errorf("got DefValue %q, want %q", f.DefValue, "false")
	}
}
