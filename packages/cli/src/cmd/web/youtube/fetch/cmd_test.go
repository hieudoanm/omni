package fetch

import (
	"testing"
)

func TestNewCmd_Flags(t *testing.T) {
	cmd := NewCmd()
	if cmd.Flag("url") == nil {
		t.Error("expected --url flag")
	}
	if cmd.Flag("lang") == nil {
		t.Error("expected --lang flag")
	}
	if cmd.Flag("output") == nil {
		t.Error("expected --output flag")
	}
	if cmd.Flag("format") == nil {
		t.Error("expected --format flag")
	}
	if cmd.Flag("no-timestamps") == nil {
		t.Error("expected --no-timestamps flag")
	}
}
