package kebabcase_test

import (
	"strings"
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/convert/kebabcase"
)

func TestRun(t *testing.T) {
	cmd := kebabcase.NewCommand()
	var buf strings.Builder
	cmd.SetOut(&buf)
	if err := kebabcase.Run(cmd, []string{"helloWorld"}); err != nil {
		t.Fatal(err)
	}
	got := strings.TrimSpace(buf.String())
	if got != "hello-world" {
		t.Errorf("Run = %q, want %q", got, "hello-world")
	}
}

func TestRun_json(t *testing.T) {
	cmd := kebabcase.NewCommand()
	cmd.Flags().Bool("json", false, "JSON output")
	cmd.Flags().Set("json", "true")
	var buf strings.Builder
	cmd.SetOut(&buf)
	if err := kebabcase.Run(cmd, []string{"test"}); err != nil {
		t.Fatal(err)
	}
	got := strings.TrimSpace(buf.String())
	if !strings.HasPrefix(got, "{") {
		t.Errorf("expected JSON output, got %q", got)
	}
}
