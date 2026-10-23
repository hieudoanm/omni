package uppercase_test

import (
	"strings"
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/convert/uppercase"
)

func TestRun(t *testing.T) {
	cmd := uppercase.NewCommand()
	var buf strings.Builder
	cmd.SetOut(&buf)
	if err := uppercase.Run(cmd, []string{"hello"}); err != nil {
		t.Fatal(err)
	}
	got := strings.TrimSpace(buf.String())
	if got != "HELLO" {
		t.Errorf("Run = %q, want %q", got, "HELLO")
	}
}

func TestRun_json(t *testing.T) {
	cmd := uppercase.NewCommand()
	cmd.Flags().Bool("json", false, "JSON output")
	cmd.Flags().Set("json", "true")
	var buf strings.Builder
	cmd.SetOut(&buf)
	if err := uppercase.Run(cmd, []string{"test"}); err != nil {
		t.Fatal(err)
	}
	got := strings.TrimSpace(buf.String())
	if !strings.HasPrefix(got, "{") {
		t.Errorf("expected JSON output, got %q", got)
	}
}
