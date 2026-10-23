package csv

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
}
