package morse_test

import (
	"strings"
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/convert/morse"
)

func TestRun_json(t *testing.T) {
	cmd := morse.NewCommand()
	cmd.Flags().Bool("json", false, "JSON output")
	cmd.Flags().Set("json", "true")
	var buf strings.Builder
	cmd.SetOut(&buf)
	if err := morse.Run(cmd, []string{"sos"}); err != nil {
		t.Fatal(err)
	}
	got := strings.TrimSpace(buf.String())
	if !strings.Contains(got, `"morse": "... --- ..."`) {
		t.Errorf("expected JSON output, got %q", got)
	}
}

func TestRun(t *testing.T) {
	cmd := morse.NewCommand()
	var buf strings.Builder
	cmd.SetOut(&buf)
	if err := morse.Run(cmd, []string{"sos"}); err != nil {
		t.Fatal(err)
	}
	got := strings.TrimSpace(buf.String())
	if got != "... --- ..." {
		t.Errorf("Run = %q, want %q", got, "... --- ...")
	}
}
