package capitalise_test

import (
	"strings"
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/convert/capitalise"
)

func TestRun(t *testing.T) {
	cmd := capitalise.NewCommand()
	var buf strings.Builder
	cmd.SetOut(&buf)
	if err := capitalise.Run(cmd, []string{"hello world"}); err != nil {
		t.Fatal(err)
	}
	got := strings.TrimSpace(buf.String())
	if got != "Hello World" {
		t.Errorf("Run = %q, want %q", got, "Hello World")
	}
}

func TestRun_json(t *testing.T) {
	cmd := capitalise.NewCommand()
	cmd.Flags().Bool("json", false, "JSON output")
	cmd.Flags().Set("json", "true")
	var buf strings.Builder
	cmd.SetOut(&buf)
	if err := capitalise.Run(cmd, []string{"test"}); err != nil {
		t.Fatal(err)
	}
	got := strings.TrimSpace(buf.String())
	if !strings.HasPrefix(got, "{") {
		t.Errorf("expected JSON output, got %q", got)
	}
}
