package ip

import (
	"testing"
)

func TestParseIPInfoResponse_IPv4(t *testing.T) {
	body := []byte(`{
		"ip": "1.2.3.4",
		"city": "Mountain View",
		"region": "California",
		"country": "US",
		"postal": "94043",
		"loc": "37.4056,-122.0775",
		"timezone": "America/Los_Angeles",
		"org": "AS15169 Google LLC"
	}`)
	info, err := parseIPInfoResponse(body)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if info.IP != "1.2.3.4" {
		t.Errorf("IP = %q, want %q", info.IP, "1.2.3.4")
	}
	if info.Version != "IPv4" {
		t.Errorf("Version = %q, want %q", info.Version, "IPv4")
	}
	if info.City != "Mountain View" {
		t.Errorf("City = %q", info.City)
	}
	if info.Latitude != "37.4056" {
		t.Errorf("Latitude = %q", info.Latitude)
	}
	if info.Longitude != "-122.0775" {
		t.Errorf("Longitude = %q", info.Longitude)
	}
	if info.Org != "AS15169 Google LLC" {
		t.Errorf("Org = %q", info.Org)
	}
	if info.ASN != "AS15169 Google LLC" {
		t.Errorf("ASN = %q", info.ASN)
	}
	if info.CountryName != "US" {
		t.Errorf("CountryName = %q", info.CountryName)
	}
	if info.CountryCode != "US" {
		t.Errorf("CountryCode = %q", info.CountryCode)
	}
}

func TestParseIPInfoResponse_IPv6(t *testing.T) {
	body := []byte(`{"ip": "2001:db8::1", "city": "", "region": "", "country": "DE", "loc": "", "timezone": "Europe/Berlin", "org": "AS123 Test"}`)
	info, err := parseIPInfoResponse(body)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if info.Version != "IPv6" {
		t.Errorf("Version = %q, want IPv6", info.Version)
	}
	if info.Latitude != "" {
		t.Errorf("Latitude = %q, want empty", info.Latitude)
	}
	if info.Longitude != "" {
		t.Errorf("Longitude = %q, want empty", info.Longitude)
	}
}

func TestParseIPInfoResponse_InvalidJSON(t *testing.T) {
	_, err := parseIPInfoResponse([]byte(`invalid`))
	if err == nil {
		t.Fatal("expected error")
	}
}

func TestParseIPInfoResponse_EmptyBody(t *testing.T) {
	_, err := parseIPInfoResponse([]byte{})
	if err == nil {
		t.Fatal("expected error")
	}
}

func TestParseIpapiResponse_Full(t *testing.T) {
	body := []byte(`{
		"ip": "5.6.7.8",
		"version": "IPv4",
		"city": "Berlin",
		"region": "Berlin",
		"country_name": "Germany",
		"country_code": "DE",
		"postal": "10115",
		"latitude": 52.52,
		"longitude": 13.405,
		"timezone": "Europe/Berlin",
		"org": "AS123 Test Org",
		"asn": "AS123"
	}`)
	info, err := parseIpapiResponse(body)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if info.IP != "5.6.7.8" {
		t.Errorf("IP = %q", info.IP)
	}
	if info.CountryName != "Germany" {
		t.Errorf("CountryName = %q", info.CountryName)
	}
	if info.CountryCode != "DE" {
		t.Errorf("CountryCode = %q", info.CountryCode)
	}
	if info.Latitude != "52.520000" {
		t.Errorf("Latitude = %q", info.Latitude)
	}
	if info.Longitude != "13.405000" {
		t.Errorf("Longitude = %q", info.Longitude)
	}
	if info.ASN != "AS123" {
		t.Errorf("ASN = %q", info.ASN)
	}
}

func TestParseIpapiResponse_EmptyFields(t *testing.T) {
	body := []byte(`{"ip": "0.0.0.0", "version": "", "city": "", "region": "", "country_name": "", "country_code": "", "postal": "", "latitude": 0, "longitude": 0, "timezone": "", "org": "", "asn": ""}`)
	info, err := parseIpapiResponse(body)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if info.Version != "" {
		t.Errorf("Version = %q, want empty", info.Version)
	}
}

func TestParseIpapiResponse_InvalidJSON(t *testing.T) {
	_, err := parseIpapiResponse([]byte(`not-json`))
	if err == nil {
		t.Fatal("expected error")
	}

	_, err = parseIpapiResponse(nil)
	if err == nil {
		t.Fatal("expected error for nil body")
	}
}
