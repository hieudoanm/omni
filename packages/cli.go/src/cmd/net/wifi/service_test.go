//go:build darwin || linux

package wifi

import (
	"reflect"
	"testing"
)

func TestParseWifiOutput_Normal(t *testing.T) {
	input := "HomeNetwork | RSSI: -50 | WPA2\nOfficeGuest | RSSI: -65 | WPA3"
	got := parseWifiOutput(input)

	if len(got) != 2 {
		t.Fatalf("expected 2 networks, got %d", len(got))
	}

	expected := []map[string]interface{}{
		{"ssid": "HomeNetwork", "rssi": -50, "security": "WPA2"},
		{"ssid": "OfficeGuest", "rssi": -65, "security": "WPA3"},
	}

	for i, exp := range expected {
		for k, v := range exp {
			if got[i][k] != v {
				t.Errorf("network[%d][%q] = %v, want %v", i, k, got[i][k], v)
			}
		}
	}
}

func TestParseWifiOutput_EmptyInput(t *testing.T) {
	got := parseWifiOutput("")
	if len(got) != 0 {
		t.Errorf("expected 0 networks for empty input, got %d", len(got))
	}
}

func TestParseWifiOutput_WhitespaceInput(t *testing.T) {
	got := parseWifiOutput("  \n  \n  ")
	if len(got) != 0 {
		t.Errorf("expected 0 networks for whitespace input, got %d", len(got))
	}
}

func TestParseWifiOutput_MalformedLine(t *testing.T) {
	input := "ValidNet | RSSI: -40 | WPA2\nMalformedLine\nAlsoBad | RSSI: -30"
	got := parseWifiOutput(input)

	if len(got) != 1 {
		t.Fatalf("expected 1 network, got %d", len(got))
	}

	if got[0]["ssid"] != "ValidNet" {
		t.Errorf("expected ssid 'ValidNet', got %v", got[0]["ssid"])
	}
}

func TestParseWifiOutput_RSSIParsing(t *testing.T) {
	input := "Test | RSSI:  -70  | WPA2"
	got := parseWifiOutput(input)

	if len(got) != 1 {
		t.Fatalf("expected 1 network, got %d", len(got))
	}

	rssi, ok := got[0]["rssi"].(int)
	if !ok {
		t.Fatalf("rssi is not int, got %T", got[0]["rssi"])
	}
	if rssi != -70 {
		t.Errorf("expected rssi -70, got %d", rssi)
	}
}

func TestParseWifiOutput_ReturnsSlice(t *testing.T) {
	got := parseWifiOutput("SSID | RSSI: -50 | WPA2")
	if got == nil {
		t.Fatal("expected non-nil slice")
	}
	if reflect.TypeOf(got).Kind() != reflect.Slice {
		t.Fatal("expected slice type")
	}
}
