package snakecase_test

import (
	"strings"
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/convert/snakecase"
)

func TestRun(t *testing.T) {
	cmd := snakecase.NewCommand()
	var buf strings.Builder
	cmd.SetOut(&buf)
	if err := snakecase.Run(cmd, []string{"helloWorld"}); err != nil {
		t.Fatal(err)
	}
	got := strings.TrimSpace(buf.String())
	if got != "hello_world" {
		t.Errorf("Run = %q, want %q", got, "hello_world")
	}
}

func TestRun_json(t *testing.T) {
	cmd := snakecase.NewCommand()
	cmd.Flags().Bool("json", false, "JSON output")
	cmd.Flags().Set("json", "true")
	var buf strings.Builder
	cmd.SetOut(&buf)
	if err := snakecase.Run(cmd, []string{"test"}); err != nil {
		t.Fatal(err)
	}
	got := strings.TrimSpace(buf.String())
	if !strings.HasPrefix(got, "{") {
		t.Errorf("expected JSON output, got %q", got)
	}
}
