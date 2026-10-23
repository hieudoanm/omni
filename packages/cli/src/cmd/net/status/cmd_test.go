package status

import (
	"strings"
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/net/internal"
	"github.com/hieudoanm/omni/packages/cli/src/libs/requests"
)

func captureOutput(f func()) string {
	return internal.CaptureOutput(f)
}

func TestNewStatusCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "status" {
		t.Errorf("Use = %q", cmd.Use)
	}
	if cmd.Short != "Check the uptime status of cloud services" {
		t.Errorf("Short = %q", cmd.Short)
	}
	wantLong := "Check and display the current operational status of various cloud services including Atlassian, GitHub, Vercel, and more."
	if cmd.Long != wantLong {
		t.Errorf("Long = %q, want %q", cmd.Long, wantLong)
	}
	wantExample := "  net status\n  net status --json"
	if cmd.Example != wantExample {
		t.Errorf("Example = %q, want %q", cmd.Example, wantExample)
	}
	if cmd.Flag("debug") == nil {
		t.Error("expected --debug flag")
	}
	if cmd.Flag("json") == nil {
		t.Error("expected --json flag")
	}
}

func TestNewStatusCmd_RunE_JSON(t *testing.T) {
	saved := netFetch
	savedJSON := statusJSON
	defer func() { netFetch = saved; statusJSON = savedJSON }()
	netFetch = func(url string, opts requests.Options) ([]byte, error) {
		return []byte(`{"page":{"name":"Test","id":"t","url":"https://test","time_zone":"UTC","updated_at":"2025-01-01T00:00:00Z"},"status":{"indicator":"none","description":"All Systems Operational"}}`), nil
	}

	cmd := NewCmd()
	statusJSON = true
	out := captureOutput(func() {
		err := cmd.RunE(cmd, []string{})
		if err != nil {
			t.Errorf("unexpected error: %v", err)
		}
	})
	if !strings.Contains(out, "Healthy") {
		t.Errorf("output missing 'Healthy': %s", out)
	}
}

func TestNewStatusCmd_RunE_Text(t *testing.T) {
	saved := netFetch
	savedJSON := statusJSON
	defer func() { netFetch = saved; statusJSON = savedJSON }()
	netFetch = func(url string, opts requests.Options) ([]byte, error) {
		return []byte(`{"page":{"name":"Test","id":"t","url":"https://test","time_zone":"UTC","updated_at":"2025-01-01T00:00:00Z"},"status":{"indicator":"none","description":"All Systems Operational"}}`), nil
	}

	cmd := NewCmd()
	statusJSON = false
	out := captureOutput(func() {
		err := cmd.RunE(cmd, []string{})
		if err != nil {
			t.Errorf("unexpected error: %v", err)
		}
	})
	if !strings.Contains(out, "services checked") {
		t.Errorf("output missing 'services checked': %s", out)
	}
	if !strings.Contains(out, "github") {
		t.Errorf("output missing 'github': %s", out)
	}
}
