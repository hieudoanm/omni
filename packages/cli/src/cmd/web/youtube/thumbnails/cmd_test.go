package thumbnails

import (
	"testing"
)

func TestNewCmd_Flags(t *testing.T) {
	cmd := NewCmd()
	if cmd.Flag("url") == nil {
		t.Error("expected --url flag")
	}
	if cmd.Flag("quality") == nil {
		t.Error("expected --quality flag")
	}
	if cmd.Flag("output") == nil {
		t.Error("expected --output flag")
	}
	if cmd.Flag("all") == nil {
		t.Error("expected --all flag")
	}
	if cmd.Flag("list") == nil {
		t.Error("expected --list flag")
	}
	if cmd.Flag("json") == nil {
		t.Error("expected --json flag")
	}
}
