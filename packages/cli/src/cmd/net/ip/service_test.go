package ip

import (
	"strings"
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/net/internal"
)

func captureOutput(f func()) string {
	return internal.CaptureOutput(f)
}

func TestDetectVPN_KnownProviders(t *testing.T) {
	providers := []string{
		"Cloudflare, Inc.",
		"Amazon Web Services",
		"Google Cloud Platform",
		"DigitalOcean, LLC",
		"Microsoft Corporation",
		"cloudflare",
		"amazon",
		"google",
		"digitalocean",
		"microsoft",
	}

	for _, org := range providers {
		t.Run(org, func(t *testing.T) {
			if !detectVPN(org) {
				t.Errorf("detectVPN(%q) = false, want true", org)
			}
		})
	}
}

func TestDetectVPN_NonMatchingOrgs(t *testing.T) {
	orgs := []string{
		"ACME Corp",
		"My ISP",
		"University of Testing",
		"",
		"Some Other Company",
	}

	for _, org := range orgs {
		t.Run(org, func(t *testing.T) {
			if detectVPN(org) {
				t.Errorf("detectVPN(%q) = true, want false", org)
			}
		})
	}
}

func TestDetectVPN_PartialMatch(t *testing.T) {
	if !detectVPN("MyCloudflareService") {
		t.Errorf("detectVPN(%q) = false, want true", "MyCloudflareService")
	}
	if !detectVPN("SomethingAmazonSomething") {
		t.Errorf("detectVPN(%q) = false, want true", "SomethingAmazonSomething")
	}
}

func TestIPInfo_Struct(t *testing.T) {
	info := IPInfo{
		IP:          "1.2.3.4",
		Version:     "IPv4",
		City:        "TestCity",
		Region:      "TestRegion",
		CountryName: "TestCountry",
		CountryCode: "TC",
		Postal:      "12345",
		Latitude:    "10.0",
		Longitude:   "20.0",
		Timezone:    "UTC",
		Org:         "TestOrg",
		ASN:         "AS12345",
	}

	if info.IP != "1.2.3.4" {
		t.Errorf("IPInfo.IP = %q, want %q", info.IP, "1.2.3.4")
	}
	if info.Org != "TestOrg" {
		t.Errorf("IPInfo.Org = %q, want %q", info.Org, "TestOrg")
	}
}

func TestPrintIPInfo_Raw(t *testing.T) {
	info := &IPInfo{
		IP: "1.2.3.4", Version: "IPv4", City: "City",
		Region: "Region", CountryName: "Country", CountryCode: "CC",
		Postal: "12345", Latitude: "10.0", Longitude: "20.0",
		Timezone: "UTC", Org: "TestOrg", ASN: "AS12345",
	}
	out := captureOutput(func() { printIPInfo(info, "test", true) })
	if !strings.Contains(out, "1.2.3.4") {
		t.Errorf("raw output missing IP: %s", out)
	}
	if !strings.Contains(out, "TestOrg") {
		t.Errorf("raw output missing Org: %s", out)
	}
}

func TestPrintIPInfo_Formatted(t *testing.T) {
	info := &IPInfo{
		IP: "5.6.7.8", Version: "IPv4", City: "MyCity",
		Region: "MyRegion", CountryName: "MyCountry", CountryCode: "MC",
		Postal: "99999", Latitude: "30.0", Longitude: "40.0",
		Timezone: "EST", Org: "My ISP", ASN: "AS67890",
	}
	out := captureOutput(func() { printIPInfo(info, "test", false) })
	if !strings.Contains(out, "5.6.7.8") {
		t.Errorf("formatted output missing IP: %s", out)
	}
	if !strings.Contains(out, "MyCountry") {
		t.Errorf("formatted output missing country: %s", out)
	}
	if strings.Contains(out, "VPN") {
		t.Errorf("formatted output should not contain VPN warning for non-VPN org: %s", out)
	}
}

func TestParsePublicIPResponse_Valid(t *testing.T) {
	ip, err := parsePublicIPResponse([]byte(`{"ip": "1.2.3.4"}`))
	if err != nil {
		t.Fatal(err)
	}
	if ip != "1.2.3.4" {
		t.Errorf("got %q, want %q", ip, "1.2.3.4")
	}
}

func TestParsePublicIPResponse_InvalidJSON(t *testing.T) {
	_, err := parsePublicIPResponse([]byte(`not json`))
	if err == nil {
		t.Fatal("expected error for invalid JSON")
	}
}

func TestParsePublicIPResponse_Empty(t *testing.T) {
	_, err := parsePublicIPResponse([]byte(`{}`))
	if err != nil {
		t.Fatal(err)
	}
	ip, _ := parsePublicIPResponse([]byte(`{}`))
	if ip != "" {
		t.Errorf("got %q, want empty", ip)
	}
}

func TestParsePublicIPResponse_NilBody(t *testing.T) {
	_, err := parsePublicIPResponse(nil)
	if err == nil {
		t.Fatal("expected error for nil body")
	}
}

func TestPrintIPInfo_VPNDetected(t *testing.T) {
	info := &IPInfo{
		IP: "10.0.0.1", Version: "IPv4", City: "CloudCity",
		Region: "CR", CountryName: "CC", CountryCode: "CC",
		Postal: "00000", Latitude: "0", Longitude: "0",
		Timezone: "UTC", Org: "Cloudflare, Inc.", ASN: "AS13335",
	}
	out := captureOutput(func() { printIPInfo(info, "cloud", false) })
	if !strings.Contains(out, "Cloudflare") {
		t.Errorf("output missing org: %s", out)
	}
	if !strings.Contains(out, "VPN") && !strings.Contains(out, "hosting") {
		t.Errorf("output should contain VPN/hosting warning: %s", out)
	}
}
