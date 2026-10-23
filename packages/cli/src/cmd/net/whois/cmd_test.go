package whois

import (
	"fmt"
	"io"
	"net"
	"strings"
	"testing"
	"time"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/net/internal"
)

func captureOutput(f func()) string {
	return internal.CaptureOutput(f)
}

type mockWhoisConn struct {
	net.Conn
	buf     []byte
	offset  int
	written []byte
}

func (m *mockWhoisConn) Read(b []byte) (int, error) {
	if m.offset >= len(m.buf) {
		return 0, io.EOF
	}
	n := copy(b, m.buf[m.offset:])
	m.offset += n
	return n, nil
}

func (m *mockWhoisConn) Write(b []byte) (int, error) {
	m.written = append(m.written, b...)
	return len(b), nil
}

func (m *mockWhoisConn) Close() error {
	return nil
}

func (m *mockWhoisConn) SetDeadline(t time.Time) error {
	return nil
}

func TestNewWhoisCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "whois [--domain <domain>]" {
		t.Errorf("Use = %q", cmd.Use)
	}
	if cmd.Short != "WHOIS lookup for a domain" {
		t.Errorf("Short = %q", cmd.Short)
	}
	wantLong := "Query WHOIS servers for domain registration information."
	if cmd.Long != wantLong {
		t.Errorf("Long = %q, want %q", cmd.Long, wantLong)
	}
	wantExample := "  net whois --domain example.com\n  net whois --domain google.com\n  net whois --domain example.com --server whois.verisign-grs.com"
	if cmd.Example != wantExample {
		t.Errorf("Example = %q, want %q", cmd.Example, wantExample)
	}
	if cmd.Flag("domain") == nil {
		t.Error("expected --domain flag")
	}
	if cmd.Flag("server") == nil {
		t.Error("expected --server flag")
	}
}

func TestNewWhoisCmd_RunE_Success(t *testing.T) {
	savedDial := netDialTimeout
	defer func() { netDialTimeout = savedDial }()
	netDialTimeout = func(network, address string, timeout time.Duration) (net.Conn, error) {
		return &mockWhoisConn{buf: []byte("WHOIS output line 1\nWHOIS output line 2\n")}, nil
	}
	savedWLS := whoisLookupServer
	defer func() { whoisLookupServer = savedWLS }()
	whoisLookupServer = func(domain string) string { return "whois.verisign-grs.com" }

	cmd := NewCmd()
	cmd.Flags().Set("domain", "example.com")
	out := captureOutput(func() {
		err := cmd.RunE(cmd, []string{})
		if err != nil {
			t.Errorf("unexpected error: %v", err)
		}
	})
	if !strings.Contains(out, "line 1") {
		t.Errorf("output missing 'line 1': %s", out)
	}
	if !strings.Contains(out, "line 2") {
		t.Errorf("output missing 'line 2': %s", out)
	}
}

func TestNewWhoisCmd_RunE_CustomServer(t *testing.T) {
	savedDial := netDialTimeout
	defer func() { netDialTimeout = savedDial }()
	netDialTimeout = func(network, address string, timeout time.Duration) (net.Conn, error) {
		return &mockWhoisConn{buf: []byte("custom server response")}, nil
	}

	cmd := NewCmd()
	cmd.Flags().Set("domain", "example.com")
	cmd.Flags().Set("server", "whois.custom.com")
	out := captureOutput(func() {
		err := cmd.RunE(cmd, []string{})
		if err != nil {
			t.Errorf("unexpected error: %v", err)
		}
	})
	if !strings.Contains(out, "custom server response") {
		t.Errorf("output missing expected response: %s", out)
	}
}

func TestNewWhoisCmd_RunE_DialError(t *testing.T) {
	savedDial := netDialTimeout
	defer func() { netDialTimeout = savedDial }()
	netDialTimeout = func(network, address string, timeout time.Duration) (net.Conn, error) {
		return nil, fmt.Errorf("connection timeout")
	}

	cmd := NewCmd()
	cmd.Flags().Set("domain", "example.com")
	err := cmd.RunE(cmd, []string{})
	if err == nil {
		t.Fatal("expected error")
	}
	if !strings.Contains(err.Error(), "connection timeout") {
		t.Errorf("unexpected error: %v", err)
	}
}
