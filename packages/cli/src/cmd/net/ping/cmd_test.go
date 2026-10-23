package ping

import (
	"testing"
)

func TestNewPingCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "ping [--host <host>]" {
		t.Errorf("Use = %q", cmd.Use)
	}
	if cmd.Short != "TCP ping to check host reachability" {
		t.Errorf("Short = %q", cmd.Short)
	}
	wantLong := "Test TCP connectivity to a host with timing statistics. Uses TCP dial (not ICMP)."
	if cmd.Long != wantLong {
		t.Errorf("Long = %q, want %q", cmd.Long, wantLong)
	}
	wantExample := "  net ping --host example.com\n  net ping --host example.com --port 443\n  net ping --host example.com --count 5\n  net ping --host google.com --port 443 --count 3 --timeout 2s"
	if cmd.Example != wantExample {
		t.Errorf("Example = %q, want %q", cmd.Example, wantExample)
	}
	for _, name := range []string{"host", "port", "count", "timeout", "json"} {
		if cmd.Flag(name) == nil {
			t.Errorf("missing flag: --%s", name)
		}
	}
}
