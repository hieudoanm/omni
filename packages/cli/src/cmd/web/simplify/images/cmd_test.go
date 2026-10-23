package images

import (
	"testing"
)

func TestNewCmd_Flags(t *testing.T) {
	cmd := NewCmd()
	if cmd.Flag("url") == nil {
		t.Error("expected --url flag")
	}
	if cmd.Flag("out") == nil {
		t.Error("expected --out flag")
	}
	if cmd.Flag("index") == nil {
		t.Error("expected --index flag")
	}
	if cmd.Flag("json") == nil {
		t.Error("expected --json flag")
	}
	if cmd.Flag("wait") == nil {
		t.Error("expected --wait flag")
	}
}
