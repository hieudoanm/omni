package scan

import (
	"net"
	"strings"
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/port/testutil"
)

func TestScanPorts_NoOpen(t *testing.T) {
	ports := scanPorts("localhost", []int{1, 2, 3}, 1)
	if len(ports) != 0 {
		t.Errorf("expected 0 open ports, got %d", len(ports))
	}
}

func TestScanPorts_WithOpen(t *testing.T) {
	ln, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatalf("failed to start listener: %v", err)
	}
	defer ln.Close()
	port := ln.Addr().(*net.TCPAddr).Port

	ports := scanPorts("127.0.0.1", []int{port}, 1)
	if len(ports) != 1 {
		t.Fatalf("expected 1 open port, got %d", len(ports))
	}
	if ports[0].Port != port {
		t.Errorf("expected port %d, got %d", port, ports[0].Port)
	}
}

func TestOutputScanResult_Empty(t *testing.T) {
	out := testutil.CaptureOutput(func() {
		outputScanResult("localhost", []portInfo{}, false)
	})
	if !strings.Contains(out, "No open ports found") {
		t.Errorf("expected 'No open ports found', got: %s", out)
	}
}

func TestOutputScanResult_WithPorts(t *testing.T) {
	ports := []portInfo{{Port: 80, Name: "HTTP"}, {Port: 443, Name: "HTTPS"}}
	out := testutil.CaptureOutput(func() {
		outputScanResult("localhost", ports, false)
	})
	if !strings.Contains(out, "Open ports on localhost") {
		t.Errorf("expected header, got: %s", out)
	}
	if !strings.Contains(out, "HTTP") || !strings.Contains(out, "HTTPS") {
		t.Errorf("expected port names in output, got: %s", out)
	}
}

func TestOutputScanResult_JSON(t *testing.T) {
	ports := []portInfo{{Port: 80, Name: "HTTP"}}
	out := testutil.CaptureOutput(func() {
		outputScanResult("localhost", ports, true)
	})
	if !strings.Contains(out, `"host": "localhost"`) {
		t.Errorf("expected JSON with host, got: %s", out)
	}
}
