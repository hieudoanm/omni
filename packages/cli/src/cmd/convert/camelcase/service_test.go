package camelcase_test

import (
	"strings"
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/convert/camelcase"
)

func TestRun(t *testing.T) {
	cmd := camelcase.NewCommand()
	var buf strings.Builder
	cmd.SetOut(&buf)
	if err := camelcase.Run(cmd, []string{"hello world"}); err != nil {
		t.Fatal(err)
	}
	got := strings.TrimSpace(buf.String())
	if got != "helloWorld" {
		t.Errorf("Run = %q, want %q", got, "helloWorld")
	}
}

func TestRun_json(t *testing.T) {
	cmd := camelcase.NewCommand()
	cmd.Flags().Bool("json", false, "JSON output")
	cmd.Flags().Set("json", "true")
	var buf strings.Builder
	cmd.SetOut(&buf)
	if err := camelcase.Run(cmd, []string{"hello world"}); err != nil {
		t.Fatal(err)
	}
	got := strings.TrimSpace(buf.String())
	if !strings.Contains(got, `"camelCase": "helloWorld"`) {
		t.Errorf("expected JSON output, got %q", got)
	}
}
