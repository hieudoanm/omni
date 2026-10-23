package braille_test

import (
	"strings"
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/convert/braille"
)

func TestRun(t *testing.T) {
	cmd := braille.NewCommand()
	var buf strings.Builder
	cmd.SetOut(&buf)
	if err := braille.Run(cmd, []string{"hello"}); err != nil {
		t.Fatal(err)
	}
	got := strings.TrimSpace(buf.String())
	if got != "⠓⠑⠇⠇⠕" {
		t.Errorf("Run = %q, want %q", got, "⠓⠑⠇⠇⠕")
	}
}

func TestRun_json(t *testing.T) {
	cmd := braille.NewCommand()
	cmd.Flags().Bool("json", false, "JSON output")
	cmd.Flags().Set("json", "true")
	var buf strings.Builder
	cmd.SetOut(&buf)
	if err := braille.Run(cmd, []string{"test"}); err != nil {
		t.Fatal(err)
	}
	got := strings.TrimSpace(buf.String())
	if !strings.HasPrefix(got, "{") {
		t.Errorf("expected JSON output, got %q", got)
	}
}
