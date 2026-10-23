package portutil

import (
	"net"
	"testing"
)

func TestBuildPortListEmpty(t *testing.T) {
	ports := BuildPortList("")
	if len(ports) == 0 {
		t.Error("expected common ports when input is empty")
	}
	for i := 1; i < len(ports); i++ {
		if ports[i-1] >= ports[i] {
			t.Errorf("ports not sorted: %d >= %d", ports[i-1], ports[i])
		}
	}
}

func TestBuildPortListComma(t *testing.T) {
	ports := BuildPortList("22,80,443")
	want := []int{22, 80, 443}
	if len(ports) != len(want) {
		t.Fatalf("got %v, want %v", ports, want)
	}
	for i, p := range ports {
		if p != want[i] {
			t.Errorf("ports[%d] = %d, want %d", i, p, want[i])
		}
	}
}

func TestBuildPortListRange(t *testing.T) {
	ports := BuildPortList("8000-8005")
	want := []int{8000, 8001, 8002, 8003, 8004, 8005}
	if len(ports) != len(want) {
		t.Fatalf("got %v, want %v", ports, want)
	}
	for i, p := range ports {
		if p != want[i] {
			t.Errorf("ports[%d] = %d, want %d", i, p, want[i])
		}
	}
}

func TestBuildPortListMixed(t *testing.T) {
	ports := BuildPortList("  3000, 80 , 443, 8000-8002 ")
	want := []int{80, 443, 3000, 8000, 8001, 8002}
	if len(ports) != len(want) {
		t.Fatalf("got %v, want %v", ports, want)
	}
	for i, p := range ports {
		if p != want[i] {
			t.Errorf("ports[%d] = %d, want %d", i, p, want[i])
		}
	}
}

func TestBuildPortListInvalid(t *testing.T) {
	ports := BuildPortList("abc,,")
	if len(ports) != 0 {
		t.Errorf("expected empty, got %v", ports)
	}
}

func TestBuildPortListReverseRange(t *testing.T) {
	ports := BuildPortList("8005-8000")
	if len(ports) != 0 {
		t.Errorf("expected empty for reversed range, got %v", ports)
	}
}

func TestCommonPorts(t *testing.T) {
	if CommonPorts[22] != "SSH" {
		t.Errorf("port 22 = %q, want SSH", CommonPorts[22])
	}
	if CommonPorts[80] != "HTTP" {
		t.Errorf("port 80 = %q, want HTTP", CommonPorts[80])
	}
	if CommonPorts[443] != "HTTPS" {
		t.Errorf("port 443 = %q, want HTTPS", CommonPorts[443])
	}
}

func TestCheckPortOpen_Closed(t *testing.T) {
	open := CheckPortOpen("127.0.0.1:1", 1)
	if open {
		t.Error("expected port 1 on 127.0.0.1 to be closed")
	}
}

func TestCheckPortOpen_Open(t *testing.T) {
	ln, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatalf("failed to start listener: %v", err)
	}
	defer ln.Close()
	addr := ln.Addr().String()

	open := CheckPortOpen(addr, 1)
	if !open {
		t.Error("expected listener port to be open")
	}
}
