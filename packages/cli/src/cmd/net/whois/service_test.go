package whois

import "testing"

func TestWhoisLookupServer(t *testing.T) {
	tests := []struct {
		domain   string
		expected string
	}{
		{"example.com", "whois.verisign-grs.com"},
		{"example.net", "whois.verisign-grs.com"},
		{"example.org", "whois.pir.org"},
		{"example.io", "whois.nic.io"},
		{"example.uk", "whois.nic.uk"},
		{"example.xyz", "whois.nic.xyz"},
		{"example.dev", "whois.nic.dev"},
		{"example.app", "whois.nic.google"},
		{"example.ai", "whois.nic.ai"},
		{"example.me", "whois.nic.me"},
		{"example.co", "whois.nic.co"},
		{"example.de", "whois.denic.de"},
		{"example.jp", "whois.jprs.jp"},
		{"example.fr", "whois.nic.fr"},
	}

	for _, tt := range tests {
		t.Run(tt.domain, func(t *testing.T) {
			got := whoisLookupServer(tt.domain)
			if got != tt.expected {
				t.Errorf("whoisLookupServer(%q) = %q, want %q", tt.domain, got, tt.expected)
			}
		})
	}
}

func TestWhoisLookupServer_UnknownTLD(t *testing.T) {
	got := whoisLookupServer("test.example")
	expected := "whois.nic.example"
	if got != expected {
		t.Errorf("whoisLookupServer for unknown TLD = %q, want %q", got, expected)
	}
}

func TestWhoisLookupServer_NoTLD(t *testing.T) {
	got := whoisLookupServer("plainhost")
	expected := "whois.iana.org"
	if got != expected {
		t.Errorf("whoisLookupServer for no TLD = %q, want %q", got, expected)
	}
}

func TestWhoisLookupServer_MultiPartDomain(t *testing.T) {
	got := whoisLookupServer("subdomain.example.co.uk")
	expected := "whois.nic.uk"
	if got != expected {
		t.Errorf("whoisLookupServer for multi-part domain = %q, want %q", got, expected)
	}
}
