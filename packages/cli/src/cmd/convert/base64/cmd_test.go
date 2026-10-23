package base64_test

import (
	"strings"
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/convert/base64"
	"github.com/spf13/cobra"
)

func findSubcommand(parent *cobra.Command, name string) *cobra.Command {
	for _, sub := range parent.Commands() {
		if sub.Name() == name {
			return sub
		}
	}
	return nil
}

func TestNewCommand_Structure(t *testing.T) {
	cmd := base64.NewCommand()
	if cmd.Use != "base64" {
		t.Errorf("Use = %q, want %q", cmd.Use, "base64")
	}
	if cmd.Short != "Base64 encode/decode" {
		t.Errorf("Short = %q, want %q", cmd.Short, "Base64 encode/decode")
	}
}

func TestNewCommand_HasSubcommands(t *testing.T) {
	cmd := base64.NewCommand()
	for _, name := range []string{"encode", "decode"} {
		if findSubcommand(cmd, name) == nil {
			t.Errorf("missing subcommand: %s", name)
		}
	}
}

func TestEncodeCmd_RunE(t *testing.T) {
	cmd := base64.NewCommand()
	encode := findSubcommand(cmd, "encode")
	var buf strings.Builder
	encode.SetOut(&buf)
	if err := encode.RunE(encode, []string{"hello"}); err != nil {
		t.Fatal(err)
	}
	got := strings.TrimSpace(buf.String())
	if got != "aGVsbG8=" {
		t.Errorf("encode = %q, want %q", got, "aGVsbG8=")
	}
}

func TestDecodeCmd_RunE(t *testing.T) {
	cmd := base64.NewCommand()
	decode := findSubcommand(cmd, "decode")
	var buf strings.Builder
	decode.SetOut(&buf)
	if err := decode.RunE(decode, []string{"aGVsbG8="}); err != nil {
		t.Fatal(err)
	}
	got := strings.TrimSpace(buf.String())
	if got != "hello" {
		t.Errorf("decode = %q, want %q", got, "hello")
	}
}
