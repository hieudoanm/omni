package ip

import (
	"errors"
	"strings"
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/libs/requests"
)

func TestFetchPublicIP_Success(t *testing.T) {
	orig := netFetch
	netFetch = func(url string, opts requests.Options) ([]byte, error) {
		return []byte(`{"ip":"1.2.3.4"}`), nil
	}
	defer func() { netFetch = orig }()

	ip, err := fetchPublicIP()
	if err != nil {
		t.Fatal(err)
	}
	if ip != "1.2.3.4" {
		t.Errorf("got %q, want %q", ip, "1.2.3.4")
	}
}

func TestFetchPublicIP_Error(t *testing.T) {
	orig := netFetch
	netFetch = func(url string, opts requests.Options) ([]byte, error) {
		return nil, errors.New("network error")
	}
	defer func() { netFetch = orig }()

	_, err := fetchPublicIP()
	if err == nil {
		t.Fatal("expected error")
	}
	if !strings.Contains(err.Error(), "failed to fetch public IP") {
		t.Errorf("unexpected error: %v", err)
	}
}

func TestFetchFromIPInfo_Success(t *testing.T) {
	orig := netFetch
	netFetch = func(url string, opts requests.Options) ([]byte, error) {
		return []byte(`{"ip":"5.6.7.8","city":"TestCity","region":"TR","country":"TC","loc":"10.0,20.0","org":"AS12345 TestOrg"}`), nil
	}
	defer func() { netFetch = orig }()

	info, err := fetchFromIPInfo("5.6.7.8")
	if err != nil {
		t.Fatal(err)
	}
	if info.IP != "5.6.7.8" {
		t.Errorf("IP = %q", info.IP)
	}
	if info.City != "TestCity" {
		t.Errorf("City = %q", info.City)
	}
	if info.Latitude != "10.0" {
		t.Errorf("Latitude = %q", info.Latitude)
	}
	if info.Org != "AS12345 TestOrg" {
		t.Errorf("Org = %q", info.Org)
	}
}

func TestFetchFromIPInfo_IPv6(t *testing.T) {
	orig := netFetch
	netFetch = func(url string, opts requests.Options) ([]byte, error) {
		return []byte(`{"ip":"::1","city":"TestCity","region":"TR","country":"TC","loc":"0.0,0.0","org":"AS0 Test"}`), nil
	}
	defer func() { netFetch = orig }()

	info, err := fetchFromIPInfo("::1")
	if err != nil {
		t.Fatal(err)
	}
	if info.Version != "IPv6" {
		t.Errorf("Version = %q, want 'IPv6'", info.Version)
	}
}

func TestFetchFromIPInfo_HTTPError(t *testing.T) {
	orig := netFetch
	netFetch = func(url string, opts requests.Options) ([]byte, error) {
		return nil, errors.New("timeout")
	}
	defer func() { netFetch = orig }()

	_, err := fetchFromIPInfo("1.2.3.4")
	if err == nil {
		t.Fatal("expected error")
	}
	if !strings.Contains(err.Error(), "IPinfo request failed") {
		t.Errorf("unexpected error: %v", err)
	}
}

func TestFetchFromIpapi_Success(t *testing.T) {
	orig := netFetch
	netFetch = func(url string, opts requests.Options) ([]byte, error) {
		return []byte(`{"ip":"9.9.9.9","version":"IPv4","city":"MyCity","region":"MR","country_name":"MyCountry","country_code":"MC","latitude":30.0,"longitude":40.0,"org":"MyISP","asn":"AS999"}`), nil
	}
	defer func() { netFetch = orig }()

	info, err := fetchFromIpapi("9.9.9.9")
	if err != nil {
		t.Fatal(err)
	}
	if info.IP != "9.9.9.9" {
		t.Errorf("IP = %q", info.IP)
	}
	if info.City != "MyCity" {
		t.Errorf("City = %q", info.City)
	}
	if info.ASN != "AS999" {
		t.Errorf("ASN = %q", info.ASN)
	}
}

func TestFetchFromIpapi_HTTPError(t *testing.T) {
	orig := netFetch
	netFetch = func(url string, opts requests.Options) ([]byte, error) {
		return nil, errors.New("connection refused")
	}
	defer func() { netFetch = orig }()

	_, err := fetchFromIpapi("1.2.3.4")
	if err == nil {
		t.Fatal("expected error")
	}
	if !strings.Contains(err.Error(), "ipapi request failed") {
		t.Errorf("unexpected error: %v", err)
	}
}
