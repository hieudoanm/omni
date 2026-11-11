package dns

import (
	"testing"
)

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "dns [--domain <domain>]" {
		t.Errorf("Use = %q", cmd.Use)
	}
	if cmd.Short != "DNS record lookup" {
		t.Errorf("Short = %q", cmd.Short)
	}
	wantLong := "Look up DNS records (A, AAAA, CNAME, MX, NS, TXT) for a domain. Defaults to all record types."
	if cmd.Long != wantLong {
		t.Errorf("Long = %q, want %q", cmd.Long, wantLong)
	}
	wantExample := "  net dns --domain example.com\n  net dns --domain example.com --type mx\n  net dns --domain example.com --json"
	if cmd.Example != wantExample {
		t.Errorf("Example = %q, want %q", cmd.Example, wantExample)
	}
	if cmd.Flag("domain") == nil {
		t.Error("expected --domain flag")
	}
	if cmd.Flag("type") == nil {
		t.Error("expected --type flag")
	}
	if cmd.Flag("json") == nil {
		t.Error("expected --json flag")
	}
}
