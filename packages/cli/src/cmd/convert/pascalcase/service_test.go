package pascalcase_test

import (
	"strings"
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/convert/pascalcase"
)

func TestRun(t *testing.T) {
	cmd := pascalcase.NewCommand()
	var buf strings.Builder
	cmd.SetOut(&buf)
	if err := pascalcase.Run(cmd, []string{"hello world"}); err != nil {
		t.Fatal(err)
	}
	got := strings.TrimSpace(buf.String())
	if got != "HelloWorld" {
		t.Errorf("Run = %q, want %q", got, "HelloWorld")
	}
}

func TestRun_json(t *testing.T) {
	cmd := pascalcase.NewCommand()
	cmd.Flags().Bool("json", false, "JSON output")
	cmd.Flags().Set("json", "true")
	var buf strings.Builder
	cmd.SetOut(&buf)
	if err := pascalcase.Run(cmd, []string{"test"}); err != nil {
		t.Fatal(err)
	}
	got := strings.TrimSpace(buf.String())
	if !strings.HasPrefix(got, "{") {
		t.Errorf("expected JSON output, got %q", got)
	}
}
