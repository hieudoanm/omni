package internal

import (
	"crypto/x509"
	"crypto/x509/pkix"
	"math/big"
	netpkg "net"
	"strings"
	"testing"
	"time"
)

func makeCert(commonName, issuer string, serial int64, version int, notBefore, notAfter time.Time, dnsNames []string, ipStrs []string, sigAlgo x509.SignatureAlgorithm, pubAlgo x509.PublicKeyAlgorithm) *x509.Certificate {
	ips := make([]netpkg.IP, len(ipStrs))
	for i, s := range ipStrs {
		ips[i] = netpkg.ParseIP(s)
	}
	return &x509.Certificate{
		Subject:            pkix.Name{CommonName: commonName},
		Issuer:             pkix.Name{CommonName: issuer},
		SerialNumber:       big.NewInt(serial),
		Version:            version,
		NotBefore:          notBefore,
		NotAfter:           notAfter,
		DNSNames:           dnsNames,
		IPAddresses:        ips,
		SignatureAlgorithm: sigAlgo,
		PublicKeyAlgorithm: pubAlgo,
	}
}

func TestBuildCertCheck_Valid(t *testing.T) {
	c := BuildCertCheck("example.com:443", 365*24*time.Hour, []string{"example.com"})
	if c.Host != "example.com:443" {
		t.Errorf("Host = %q", c.Host)
	}
	if c.Status != "valid" {
		t.Errorf("Status = %q, want 'valid'", c.Status)
	}
	if c.DNSCount != 1 {
		t.Errorf("DNSCount = %d, want 1", c.DNSCount)
	}
}

func TestBuildCertCheck_ExpiringSoon(t *testing.T) {
	c := BuildCertCheck("example.com", 24*time.Hour, nil)
	if c.Status != "expiring_soon" {
		t.Errorf("Status = %q, want 'expiring_soon'", c.Status)
	}
}

func TestBuildCertCheck_Expired(t *testing.T) {
	c := BuildCertCheck("example.com", -1*time.Hour, nil)
	if c.Status != "expired" {
		t.Errorf("Status = %q, want 'expired'", c.Status)
	}
}

func TestBuildCertCheck_ZeroRemaining(t *testing.T) {
	c := BuildCertCheck("example.com", 0, nil)
	if c.Status != "expiring_soon" {
		t.Errorf("Status = %q, want 'expiring_soon' for zero remaining (since 0 < 30d)", c.Status)
	}
}

func TestBuildCertCheck_JustOver30Days(t *testing.T) {
	c := BuildCertCheck("example.com", 30*24*time.Hour+time.Second, []string{"a.com", "b.com"})
	if c.Status != "valid" {
		t.Errorf("Status = %q, want 'valid' for remaining > 30 days", c.Status)
	}
	if c.DNSCount != 2 {
		t.Errorf("DNSCount = %d, want 2", c.DNSCount)
	}
}

func TestFormatCerts_SingleWithDNSAndIPs(t *testing.T) {
	cert := makeCert("example.com", "Test CA", 12345, 3,
		time.Date(2025, 1, 1, 0, 0, 0, 0, time.UTC),
		time.Date(2027, 1, 1, 0, 0, 0, 0, time.UTC),
		[]string{"example.com", "www.example.com"},
		[]string{"1.2.3.4"},
		x509.SHA256WithRSA, x509.RSA,
	)
	result := FormatCerts([]*x509.Certificate{cert})
	if len(result) != 1 {
		t.Fatalf("got %d certs, want 1", len(result))
	}
	c := result[0]
	if c.Subject != "CN=example.com" {
		t.Errorf("Subject = %q, want 'CN=example.com'", c.Subject)
	}
	if c.Issuer != "CN=Test CA" {
		t.Errorf("Issuer = %q, want 'CN=Test CA'", c.Issuer)
	}
	if c.Serial != "12345" {
		t.Errorf("Serial = %q, want '12345'", c.Serial)
	}
	if c.Version != 3 {
		t.Errorf("Version = %d, want 3", c.Version)
	}
	if c.Expired {
		t.Error("cert should not be expired")
	}
	if len(c.DNSNames) != 2 {
		t.Errorf("DNSNames = %v, want 2 entries", c.DNSNames)
	}
	if len(c.IPAddresses) != 1 || c.IPAddresses[0] != "1.2.3.4" {
		t.Errorf("IPAddresses = %v", c.IPAddresses)
	}
	if c.SignatureAlgo != "SHA256-RSA" {
		t.Errorf("SignatureAlgo = %q, want 'SHA256-RSA'", c.SignatureAlgo)
	}
	if c.PublicKeyAlgo != "RSA" {
		t.Errorf("PublicKeyAlgo = %q, want 'RSA'", c.PublicKeyAlgo)
	}
}

func TestFormatCerts_Minimal(t *testing.T) {
	cert := makeCert("minimal", "CA", 0, 1,
		time.Date(2025, 6, 1, 0, 0, 0, 0, time.UTC),
		time.Date(2026, 6, 1, 0, 0, 0, 0, time.UTC),
		nil, nil,
		x509.SHA1WithRSA, x509.RSA,
	)
	result := FormatCerts([]*x509.Certificate{cert})
	if len(result) != 1 {
		t.Fatalf("got %d certs, want 1", len(result))
	}
	c := result[0]
	if c.Subject != "CN=minimal" {
		t.Errorf("Subject = %q", c.Subject)
	}
	if len(c.DNSNames) != 0 {
		t.Errorf("expected no DNS names, got %v", c.DNSNames)
	}
	if len(c.IPAddresses) != 0 {
		t.Errorf("expected no IP addresses, got %v", c.IPAddresses)
	}
}

func TestFormatCerts_Expired(t *testing.T) {
	cert := makeCert("expired", "CA", 1, 3,
		time.Date(2020, 1, 1, 0, 0, 0, 0, time.UTC),
		time.Date(2021, 1, 1, 0, 0, 0, 0, time.UTC),
		nil, nil,
		x509.SHA256WithRSA, x509.RSA,
	)
	result := FormatCerts([]*x509.Certificate{cert})
	if len(result) != 1 {
		t.Fatalf("got %d certs, want 1", len(result))
	}
	if !result[0].Expired {
		t.Error("expected cert to be expired")
	}
}

func TestFormatCerts_Empty(t *testing.T) {
	result := FormatCerts(nil)
	if len(result) != 0 {
		t.Errorf("got %d certs from nil, want 0", len(result))
	}
	result = FormatCerts([]*x509.Certificate{})
	if len(result) != 0 {
		t.Errorf("got %d certs from empty, want 0", len(result))
	}
}

func TestFormatCerts_Multiple(t *testing.T) {
	certs := []*x509.Certificate{
		makeCert("first", "CA1", 1, 3,
			time.Date(2025, 1, 1, 0, 0, 0, 0, time.UTC),
			time.Date(2026, 7, 1, 0, 0, 0, 0, time.UTC),
			[]string{"first.com"}, nil,
			x509.SHA256WithRSA, x509.RSA,
		),
		makeCert("second", "CA2", 2, 1,
			time.Date(2025, 6, 1, 0, 0, 0, 0, time.UTC),
			time.Date(2026, 12, 1, 0, 0, 0, 0, time.UTC),
			nil, nil,
			x509.SHA384WithRSA, x509.ECDSA,
		),
	}
	result := FormatCerts(certs)
	if len(result) != 2 {
		t.Fatalf("got %d certs, want 2", len(result))
	}
	if result[0].Subject != "CN=first" {
		t.Errorf("first Subject = %q", result[0].Subject)
	}
	if result[1].Subject != "CN=second" {
		t.Errorf("second Subject = %q", result[1].Subject)
	}
	if result[1].PublicKeyAlgo != "ECDSA" {
		t.Errorf("second PublicKeyAlgo = %q, want 'ECDSA'", result[1].PublicKeyAlgo)
	}
}

func TestPrintJSON(t *testing.T) {
	data := map[string]string{"key": "value"}
	out := CaptureOutput(func() { PrintJSON(data) })
	if !strings.Contains(out, "key") || !strings.Contains(out, "value") {
		t.Errorf("PrintJSON output = %q, want key/value", out)
	}
}

func TestPrintJSON_Nil(t *testing.T) {
	out := CaptureOutput(func() { PrintJSON(nil) })
	if !strings.Contains(out, "null") {
		t.Errorf("PrintJSON(nil) = %q, want 'null'", out)
	}
}

func TestPrintCertInfo(t *testing.T) {
	certs := []CertJSON{
		{
			Subject:       "test.example.com",
			Issuer:        "Test CA",
			Serial:        "123",
			Version:       3,
			NotBefore:     "2025-01-01 00:00:00",
			NotAfter:      "2026-01-01 00:00:00",
			Expired:       false,
			Remaining:     "100h0m0s",
			DNSNames:      []string{"test.example.com"},
			SignatureAlgo: "SHA256-RSA",
			PublicKeyAlgo: "RSA",
		},
	}
	out := CaptureOutput(func() { PrintCertInfo(certs) })
	if !strings.Contains(out, "test.example.com") {
		t.Errorf("output missing subject: %s", out)
	}
	if !strings.Contains(out, "Test CA") {
		t.Errorf("output missing issuer: %s", out)
	}
	if !strings.Contains(out, "Valid") {
		t.Errorf("output missing status: %s", out)
	}
}

func TestPrintCertInfo_ExpiredWithIPs(t *testing.T) {
	certs := []CertJSON{
		{
			Subject:       "expired.example.com",
			Issuer:        "CA",
			Serial:        "456",
			Version:       3,
			NotBefore:     "2020-01-01 00:00:00",
			NotAfter:      "2021-01-01 00:00:00",
			Expired:       true,
			Remaining:     "-500h0m0s",
			DNSNames:      []string{"expired.example.com"},
			IPAddresses:   []string{"10.0.0.1"},
			SignatureAlgo: "SHA256-RSA",
			PublicKeyAlgo: "RSA",
		},
	}
	out := CaptureOutput(func() { PrintCertInfo(certs) })
	if !strings.Contains(out, "EXPIRED") {
		t.Errorf("output missing EXPIRED: %s", out)
	}
	if !strings.Contains(out, "10.0.0.1") {
		t.Errorf("output missing IP address: %s", out)
	}
}

func TestPrintCertInfo_NoDNSNoIP(t *testing.T) {
	certs := []CertJSON{
		{
			Subject:       "bare",
			Issuer:        "CA",
			Serial:        "789",
			Version:       1,
			NotBefore:     "2025-01-01 00:00:00",
			NotAfter:      "2026-01-01 00:00:00",
			Expired:       false,
			Remaining:     "200h0m0s",
			SignatureAlgo: "SHA1-RSA",
			PublicKeyAlgo: "RSA",
		},
	}
	out := CaptureOutput(func() { PrintCertInfo(certs) })
	if strings.Contains(out, "DNS Names") {
		t.Errorf("unexpected DNS section: %s", out)
	}
	if strings.Contains(out, "IP Addresses") {
		t.Errorf("unexpected IP section: %s", out)
	}
}

func TestPrintCertCheck_Valid(t *testing.T) {
	c := CertCheck{Host: "example.com", Status: "valid", DNSCount: 3}
	out := CaptureOutput(func() { PrintCertCheck(c) })
	if !strings.Contains(out, "Valid") {
		t.Errorf("output = %q, want 'Valid'", out)
	}
	if !strings.Contains(out, "3 DNS names") {
		t.Errorf("output = %q, want '3 DNS names'", out)
	}
}

func TestPrintCertCheck_Expired(t *testing.T) {
	c := CertCheck{Host: "bad.com", Status: "expired", DNSCount: 0}
	out := CaptureOutput(func() { PrintCertCheck(c) })
	if !strings.Contains(out, "EXPIRED") {
		t.Errorf("output = %q, want 'EXPIRED'", out)
	}
}

func TestPrintCertCheck_ExpiringSoon(t *testing.T) {
	c := CertCheck{Host: "warn.com", Status: "expiring_soon", DNSCount: 1}
	out := CaptureOutput(func() { PrintCertCheck(c) })
	if !strings.Contains(out, "Expiring soon") {
		t.Errorf("output = %q, want 'Expiring soon'", out)
	}
}
