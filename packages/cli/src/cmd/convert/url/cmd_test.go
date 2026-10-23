package url_test

import (
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/convert/url"
)

func TestNewCommand_Structure(t *testing.T) {
	cmd := url.NewCommand()
	if cmd.Use != "url [text]" {
		t.Errorf("Use = %q, want %q", cmd.Use, "url [text]")
	}
	if cmd.Short != "Encode or decode a URL" {
		t.Errorf("Short = %q, want %q", cmd.Short, "Encode or decode a URL")
	}
	if cmd.Flag("decode") == nil {
		t.Error("expected --decode flag")
	}
}
