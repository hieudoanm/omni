package ping

import (
	"fmt"
	"net"
	"strings"
	"testing"
	"time"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/net/internal"
)

func captureOutput(f func()) string {
	return internal.CaptureOutput(f)
}

type mockConn struct {
	net.Conn
	closed bool
}

func (m *mockConn) Close() error {
	m.closed = true
	return nil
}

func TestPingRun_Success(t *testing.T) {
	saved := netDialTimeout
	defer func() { netDialTimeout = saved }()
	netDialTimeout = func(network, address string, timeout time.Duration) (net.Conn, error) {
		return &mockConn{}, nil
	}

	err := pingRun("example.com", 80, 1, 5*time.Second)
	if err != nil {
		t.Errorf("unexpected error: %v", err)
	}
}

func TestPingRun_AllFail(t *testing.T) {
	saved := netDialTimeout
	defer func() { netDialTimeout = saved }()
	netDialTimeout = func(network, address string, timeout time.Duration) (net.Conn, error) {
		return nil, fmt.Errorf("connection refused")
	}

	out := captureOutput(func() {
		err := pingRun("example.com", 80, 2, 1*time.Second)
		if err != nil {
			t.Errorf("unexpected error: %v", err)
		}
	})
	if !strings.Contains(out, "100%") {
		t.Errorf("output missing 100%% loss: %s", out)
	}
}

func TestPingRun_JSON(t *testing.T) {
	saved := netDialTimeout
	defer func() { netDialTimeout = saved }()
	callCount := 0
	netDialTimeout = func(network, address string, timeout time.Duration) (net.Conn, error) {
		callCount++
		if callCount == 1 {
			return &mockConn{}, nil
		}
		return nil, fmt.Errorf("timeout")
	}

	savedJSON := pingJSON
	pingJSON = true
	defer func() { pingJSON = savedJSON }()

	out := captureOutput(func() {
		err := pingRun("example.com", 80, 2, 5*time.Second)
		if err != nil {
			t.Errorf("unexpected error: %v", err)
		}
	})
	if !strings.Contains(out, "successes") {
		t.Errorf("output missing 'successes': %s", out)
	}
	if !strings.Contains(out, "failures") {
		t.Errorf("output missing 'failures': %s", out)
	}
}
