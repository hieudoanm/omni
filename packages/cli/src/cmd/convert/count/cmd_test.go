package count_test

import (
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/convert/count"
)

func TestNewCommand_Structure(t *testing.T) {
	cmd := count.NewCommand()
	if cmd.Use != "count <text>" {
		t.Errorf("Use = %q, want %q", cmd.Use, "count <text>")
	}
	if cmd.Short != "Count characters, words, and lines in text" {
		t.Errorf("Short = %q, want %q", cmd.Short, "Count characters, words, and lines in text")
	}
}
