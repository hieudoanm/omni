//go:build darwin || linux

package wifi

import "testing"

func TestNewWifiCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "wifi" {
		t.Errorf("Use = %q", cmd.Use)
	}
	if cmd.Short != "List nearby Wi-Fi networks" {
		t.Errorf("Short = %q", cmd.Short)
	}
	wantLong := "Scan and list nearby Wi-Fi networks with signal strength and security information."
	if cmd.Long != wantLong {
		t.Errorf("Long = %q, want %q", cmd.Long, wantLong)
	}
	wantExample := "  net wifi\n  net wifi --json"
	if cmd.Example != wantExample {
		t.Errorf("Example = %q, want %q", cmd.Example, wantExample)
	}
	if cmd.Flag("json") == nil {
		t.Error("expected --json flag")
	}
}
