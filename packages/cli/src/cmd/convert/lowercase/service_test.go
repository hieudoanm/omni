package lowercase_test

import (
	"strings"
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/convert/lowercase"
)

func TestRun(t *testing.T) {
	cmd := lowercase.NewCommand()
	var buf strings.Builder
	cmd.SetOut(&buf)
	if err := lowercase.Run(cmd, []string{"HELLO"}); err != nil {
		t.Fatal(err)
	}
	got := strings.TrimSpace(buf.String())
	if got != "hello" {
		t.Errorf("Run = %q, want %q", got, "hello")
	}
}

func TestRun_json(t *testing.T) {
	cmd := lowercase.NewCommand()
	cmd.Flags().Bool("json", false, "JSON output")
	cmd.Flags().Set("json", "true")
	var buf strings.Builder
	cmd.SetOut(&buf)
	if err := lowercase.Run(cmd, []string{"test"}); err != nil {
		t.Fatal(err)
	}
	got := strings.TrimSpace(buf.String())
	if !strings.HasPrefix(got, "{") {
		t.Errorf("expected JSON output, got %q", got)
	}
}
