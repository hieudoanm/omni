package status

import (
	"bytes"
	"errors"
	"io"
	"log"
	"os"
	"strings"
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/libs/requests"
)

func TestParseStatusResponse_Valid(t *testing.T) {
	body := []byte(`{"page":{"name":"TestPage"},"status":{"indicator":"none","description":"All Good"}}`)
	resp, err := parseStatusResponse(body)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if resp.Page.Name != "TestPage" {
		t.Errorf("Page.Name = %q", resp.Page.Name)
	}
	if resp.Status.Indicator != "none" {
		t.Errorf("Status.Indicator = %q", resp.Status.Indicator)
	}
}

func TestParseStatusResponse_InvalidJSON(t *testing.T) {
	_, err := parseStatusResponse([]byte(`invalid`))
	if err == nil {
		t.Fatal("expected error")
	}
}

func TestDescriptiveStatusFromResponse_Healthy(t *testing.T) {
	resp := Response{Status: Status{Indicator: "none"}}
	if s := descriptiveStatusFromResponse(resp); s != "Healthy" {
		t.Errorf("got %q, want 'Healthy'", s)
	}
}

func TestDescriptiveStatusFromResponse_Offline(t *testing.T) {
	resp := Response{Status: Status{Indicator: "critical"}}
	if s := descriptiveStatusFromResponse(resp); s != "Offline" {
		t.Errorf("got %q, want 'Offline'", s)
	}

	resp = Response{Status: Status{Indicator: "major"}}
	if s := descriptiveStatusFromResponse(resp); s != "Offline" {
		t.Errorf("got %q, want 'Offline'", s)
	}

	resp = Response{Status: Status{Indicator: "minor"}}
	if s := descriptiveStatusFromResponse(resp); s != "Offline" {
		t.Errorf("got %q, want 'Offline'", s)
	}
}

var mockStatusResponse = []byte(`{"page":{"id":"1","name":"GitHub","url":"https://status.github.com","time_zone":"UTC","updated_at":"2024-01-01T00:00:00Z"},"status":{"indicator":"none","description":"All Systems Operational"}}`)

func mockFetchSuccess(_ string, _ requests.Options) ([]byte, error) {
	return mockStatusResponse, nil
}

func mockFetchError(_ string, _ requests.Options) ([]byte, error) {
	return nil, errors.New("network error")
}

func captureStdout(fn func()) string {
	old := os.Stdout
	r, w, _ := os.Pipe()
	os.Stdout = w
	fn()
	w.Close()
	var buf bytes.Buffer
	io.Copy(&buf, r)
	os.Stdout = old
	return buf.String()
}

func TestPrintFullStatus(t *testing.T) {
	oldFetch := netFetch
	netFetch = mockFetchSuccess
	defer func() { netFetch = oldFetch }()

	output := captureStdout(func() {
		PrintFullStatus("https://example.com", false)
	})
	if !strings.Contains(output, "GitHub") {
		t.Errorf("expected GitHub in output, got: %s", output)
	}
	if !strings.Contains(output, "All Systems Operational") {
		t.Errorf("expected All Systems Operational in output, got: %s", output)
	}
}

func TestPrintFullStatus_Error(t *testing.T) {
	oldFetch := netFetch
	netFetch = mockFetchError
	defer func() { netFetch = oldFetch }()

	r, w, _ := os.Pipe()
	oldLog := log.Writer()
	log.SetOutput(w)
	PrintFullStatus("https://example.com", false)
	w.Close()
	log.SetOutput(oldLog)
	var buf bytes.Buffer
	io.Copy(&buf, r)

	if !strings.Contains(buf.String(), "Error: network error") {
		t.Errorf("expected error in log output, got: %s", buf.String())
	}
}

func TestGetStatus_Success(t *testing.T) {
	oldFetch := netFetch
	netFetch = mockFetchSuccess
	defer func() { netFetch = oldFetch }()

	resp, err := GetStatus("https://example.com", false)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if resp.Page.Name != "GitHub" {
		t.Errorf("Page.Name = %q, want 'GitHub'", resp.Page.Name)
	}
}

func TestGetStatus_Error(t *testing.T) {
	oldFetch := netFetch
	netFetch = mockFetchError
	defer func() { netFetch = oldFetch }()

	_, err := GetStatus("https://example.com", false)
	if err == nil {
		t.Fatal("expected error")
	}
}

func TestGetDescriptiveStatus(t *testing.T) {
	oldFetch := netFetch
	netFetch = mockFetchSuccess
	defer func() { netFetch = oldFetch }()

	s := GetDescriptiveStatus("github", "https://example.com", false)
	if s != "Healthy" {
		t.Errorf("expected Healthy, got: %s", s)
	}
}

func TestGetDescriptiveStatus_Error(t *testing.T) {
	oldFetch := netFetch
	netFetch = mockFetchError
	defer func() { netFetch = oldFetch }()

	s := GetDescriptiveStatus("github", "https://example.com", false)
	if !strings.Contains(s, "Error:") {
		t.Errorf("expected Error in message, got: %s", s)
	}
}

func TestPrintDescriptiveStatus(t *testing.T) {
	oldFetch := netFetch
	netFetch = mockFetchSuccess
	defer func() { netFetch = oldFetch }()

	output := captureStdout(func() {
		PrintDescriptiveStatus("github", "https://example.com", false)
	})
	if !strings.Contains(output, "All Systems Operational") {
		t.Errorf("expected All Systems Operational in output, got: %s", output)
	}
}

func TestPrintDescriptiveStatus_Error(t *testing.T) {
	oldFetch := netFetch
	netFetch = mockFetchError
	defer func() { netFetch = oldFetch }()

	r, w, _ := os.Pipe()
	oldLog := log.Writer()
	log.SetOutput(w)
	PrintDescriptiveStatus("github", "https://example.com", false)
	w.Close()
	log.SetOutput(oldLog)
	var buf bytes.Buffer
	io.Copy(&buf, r)

	if !strings.Contains(buf.String(), "Error: network error") {
		t.Errorf("expected error in log output, got: %s", buf.String())
	}
}
