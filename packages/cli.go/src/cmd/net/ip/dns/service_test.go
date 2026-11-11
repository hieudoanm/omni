package dns

import (
	"context"
	"io"
	"net"
	"os"
	"strings"
	"testing"
)

func captureOutput(fn func()) string {
	r, w, _ := os.Pipe()
	orig := os.Stdout
	os.Stdout = w
	fn()
	w.Close()
	out, _ := io.ReadAll(r)
	os.Stdout = orig
	return strings.TrimRight(string(out), "\n")
}

func TestDNSRun_InvalidType(t *testing.T) {
	err := dnsRun("example.com", "invalid")
	if err == nil {
		t.Fatal("expected error for invalid record type")
	}
	if !strings.Contains(err.Error(), "unsupported record type") {
		t.Errorf("unexpected error: %v", err)
	}
}

func TestDNSRun_A(t *testing.T) {
	saved := dnsLookupHost
	defer func() { dnsLookupHost = saved }()
	dnsLookupHost = func(ctx context.Context, host string) ([]string, error) {
		return []string{"1.2.3.4", "::1"}, nil
	}

	err := dnsRun("example.com", "a")
	if err != nil {
		t.Errorf("unexpected error: %v", err)
	}
}

func TestDNSRun_AAAA(t *testing.T) {
	saved := dnsLookupHost
	defer func() { dnsLookupHost = saved }()
	dnsLookupHost = func(ctx context.Context, host string) ([]string, error) {
		return []string{"1.2.3.4", "2001:db8::1"}, nil
	}

	err := dnsRun("example.com", "aaaa")
	if err != nil {
		t.Errorf("unexpected error: %v", err)
	}
}

func TestDNSRun_AllTypes(t *testing.T) {
	savedHost := dnsLookupHost
	savedCNAME := dnsLookupCNAME
	savedMX := dnsLookupMX
	savedNS := dnsLookupNS
	savedTXT := dnsLookupTXT
	defer func() {
		dnsLookupHost = savedHost
		dnsLookupCNAME = savedCNAME
		dnsLookupMX = savedMX
		dnsLookupNS = savedNS
		dnsLookupTXT = savedTXT
	}()
	dnsLookupHost = func(ctx context.Context, host string) ([]string, error) {
		return []string{"93.184.216.34"}, nil
	}
	dnsLookupCNAME = func(ctx context.Context, host string) (string, error) {
		return "example.com.", nil
	}
	dnsLookupMX = func(ctx context.Context, name string) ([]*net.MX, error) {
		return []*net.MX{{Host: "mail.example.com.", Pref: 10}}, nil
	}
	dnsLookupNS = func(ctx context.Context, name string) ([]*net.NS, error) {
		return []*net.NS{{Host: "ns1.example.com."}}, nil
	}
	dnsLookupTXT = func(ctx context.Context, name string) ([]string, error) {
		return []string{"v=spf1 include:_spf.example.com"}, nil
	}

	out := captureOutput(func() {
		err := dnsRun("example.com", "")
		if err != nil {
			t.Errorf("unexpected error: %v", err)
		}
	})
	if !strings.Contains(out, "93.184.216.34") {
		t.Errorf("output missing A record: %s", out)
	}
}

func TestDNSRun_JSON(t *testing.T) {
	savedHost := dnsLookupHost
	savedJSON := dnsJSON
	defer func() { dnsLookupHost = savedHost; dnsJSON = savedJSON }()
	dnsLookupHost = func(ctx context.Context, host string) ([]string, error) {
		return []string{"1.2.3.4"}, nil
	}

	dnsJSON = true
	out := captureOutput(func() {
		err := dnsRun("example.com", "a")
		if err != nil {
			t.Errorf("unexpected error: %v", err)
		}
	})
	if !strings.Contains(out, "1.2.3.4") {
		t.Errorf("output missing IP: %s", out)
	}
	if !strings.Contains(out, "domain") {
		t.Errorf("output missing 'domain' key: %s", out)
	}
}

func TestDNSRun_NoRecords(t *testing.T) {
	savedHost := dnsLookupHost
	savedCNAME := dnsLookupCNAME
	savedMX := dnsLookupMX
	savedNS := dnsLookupNS
	savedTXT := dnsLookupTXT
	defer func() {
		dnsLookupHost = savedHost
		dnsLookupCNAME = savedCNAME
		dnsLookupMX = savedMX
		dnsLookupNS = savedNS
		dnsLookupTXT = savedTXT
	}()
	dnsLookupHost = func(ctx context.Context, host string) ([]string, error) {
		return nil, nil
	}
	dnsLookupCNAME = func(ctx context.Context, host string) (string, error) {
		return "", nil
	}
	dnsLookupMX = func(ctx context.Context, name string) ([]*net.MX, error) {
		return nil, nil
	}
	dnsLookupNS = func(ctx context.Context, name string) ([]*net.NS, error) {
		return nil, nil
	}
	dnsLookupTXT = func(ctx context.Context, name string) ([]string, error) {
		return nil, nil
	}

	out := captureOutput(func() {
		err := dnsRun("example.com", "")
		if err != nil {
			t.Errorf("unexpected error: %v", err)
		}
	})
	if !strings.Contains(out, "no records found") {
		t.Errorf("output missing 'no records found': %s", out)
	}
}

func TestDNSRun_MXEmptyHost(t *testing.T) {
	savedMX := dnsLookupMX
	defer func() { dnsLookupMX = savedMX }()
	dnsLookupMX = func(ctx context.Context, name string) ([]*net.MX, error) {
		return []*net.MX{{Host: "", Pref: 10}}, nil
	}

	err := dnsRun("example.com", "mx")
	if err != nil {
		t.Errorf("unexpected error: %v", err)
	}
}

func TestDNSRun_NSEmptyHost(t *testing.T) {
	savedNS := dnsLookupNS
	defer func() { dnsLookupNS = savedNS }()
	dnsLookupNS = func(ctx context.Context, name string) ([]*net.NS, error) {
		return []*net.NS{{Host: ""}}, nil
	}

	err := dnsRun("example.com", "ns")
	if err != nil {
		t.Errorf("unexpected error: %v", err)
	}
}
