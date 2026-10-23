package icons

import (
	"testing"
)

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "icons <file>" {
		t.Errorf("Use = %q, want %q", cmd.Use, "icons <file>")
	}
	if cmd.Args == nil {
		t.Fatal("expected Args validator")
	}
	flag := cmd.Flags().Lookup("sizes")
	if flag == nil {
		t.Fatal("expected --sizes flag")
	}
	if flag.DefValue != "[192,512]" {
		t.Errorf("--sizes default = %q, want %q", flag.DefValue, "[192,512]")
	}
}
