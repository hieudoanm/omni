package ip

import (
	"fmt"
	"strings"
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/libs/requests"
)

func TestNewIPCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "ip" {
		t.Errorf("Use = %q", cmd.Use)
	}
	if cmd.Short != "Look up your public IP and geolocation" {
		t.Errorf("Short = %q", cmd.Short)
	}
	wantLong := "Look up your public IP address and geolocation information from multiple providers."
	if cmd.Long != wantLong {
		t.Errorf("Long = %q, want %q", cmd.Long, wantLong)
	}
	wantExample := "  net ip\n  net ip --json\n  net ip --raw"
	if cmd.Example != wantExample {
		t.Errorf("Example = %q, want %q", cmd.Example, wantExample)
	}
	if cmd.Flag("raw") == nil {
		t.Error("expected --raw flag")
	}
	if cmd.Flag("json") == nil {
		t.Error("expected --json flag")
	}
}

func TestNewIPCmd_RunE_IPInfoSuccess(t *testing.T) {
	orig := netFetch
	callCount := 0
	netFetch = func(url string, opts requests.Options) ([]byte, error) {
		callCount++
		if strings.Contains(url, "ipify") {
			return []byte(`{"ip":"1.2.3.4"}`), nil
		}
		if strings.Contains(url, "ipinfo") {
			return []byte(`{"ip":"1.2.3.4","city":"City","region":"R","country":"CC","loc":"1.0,2.0","org":"AS1 Org"}`), nil
		}
		return nil, fmt.Errorf("unexpected call")
	}
	defer func() { netFetch = orig }()

	out := captureOutput(func() {
		cmd := NewCmd()
		if err := cmd.RunE(cmd, nil); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(out, "1.2.3.4") {
		t.Errorf("expected IP in output, got %q", out)
	}
	if callCount != 2 {
		t.Errorf("expected 2 netFetch calls, got %d", callCount)
	}
}

func TestNewIPCmd_RunE_IPInfoFailsFallbackToIpapi(t *testing.T) {
	orig := netFetch
	netFetch = func(url string, opts requests.Options) ([]byte, error) {
		if strings.Contains(url, "ipify") {
			return []byte(`{"ip":"5.5.5.5"}`), nil
		}
		if strings.Contains(url, "ipinfo") {
			return nil, fmt.Errorf("ipinfo failed")
		}
		if strings.Contains(url, "ipapi") {
			return []byte(`{"ip":"5.5.5.5","version":"IPv4","city":"FC","region":"FR","country_name":"FC","country_code":"FC","latitude":5.0,"longitude":5.0,"org":"F","asn":"AS5"}`), nil
		}
		return nil, fmt.Errorf("unexpected")
	}
	defer func() { netFetch = orig }()

	out := captureOutput(func() {
		cmd := NewCmd()
		if err := cmd.RunE(cmd, nil); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(out, "5.5.5.5") {
		t.Errorf("expected IP in output, got %q", out)
	}
}

func TestNewIPCmd_RunE_BothProvidersFail(t *testing.T) {
	orig := netFetch
	netFetch = func(url string, opts requests.Options) ([]byte, error) {
		if strings.Contains(url, "ipify") {
			return []byte(`{"ip":"1.2.3.4"}`), nil
		}
		return nil, fmt.Errorf("provider error")
	}
	defer func() { netFetch = orig }()

	cmd := NewCmd()
	err := cmd.RunE(cmd, nil)
	if err == nil {
		t.Fatal("expected error")
	}
	if !strings.Contains(err.Error(), "both providers failed") {
		t.Errorf("unexpected error: %v", err)
	}
}

func TestNewIPCmd_RunE_RawFlag(t *testing.T) {
	orig := netFetch
	netFetch = func(url string, opts requests.Options) ([]byte, error) {
		if strings.Contains(url, "ipify") {
			return []byte(`{"ip":"7.7.7.7"}`), nil
		}
		return []byte(`{"ip":"7.7.7.7","city":"C","region":"R","country":"CC","loc":"0.0,0.0","org":"AS7 O"}`), nil
	}
	defer func() { netFetch = orig }()

	cmd := NewCmd()
	cmd.Flags().Set("raw", "true")
	out := captureOutput(func() {
		if err := cmd.RunE(cmd, nil); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(out, `"ip": "7.7.7.7"`) {
		t.Errorf("expected JSON output, got %q", out)
	}
}
