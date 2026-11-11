package hex

import (
	"testing"
)

func TestNewCommand(t *testing.T) {
	cmd := NewCommand()
	if cmd.Use != "hex" {
		t.Errorf("Use = %q, want %q", cmd.Use, "hex")
	}
	if cmd.RunE == nil {
		t.Error("RunE is nil")
	}
	f := cmd.Flag("hex")
	if f == nil {
		t.Fatal("missing --hex flag")
	}
}

func TestParseHex(t *testing.T) {
	c, err := parseHex("#D3045D")
	if err != nil {
		t.Fatal(err)
	}
	if c.r != 211 || c.g != 4 || c.b != 93 {
		t.Errorf("got rgb(%f,%f,%f), want rgb(211,4,93)", c.r, c.g, c.b)
	}
}

func TestParseHex_NoHash(t *testing.T) {
	c, err := parseHex("D3045D")
	if err != nil {
		t.Fatal(err)
	}
	if c.r != 211 || c.g != 4 || c.b != 93 {
		t.Errorf("got rgb(%f,%f,%f)", c.r, c.g, c.b)
	}
}

func TestParseHex_Invalid(t *testing.T) {
	_, err := parseHex("XYZ")
	if err == nil {
		t.Error("expected error for invalid hex")
	}
}

func TestHexToName_Exact(t *testing.T) {
	// Garnet Sunrise 3 is unique — only one entry with this hex
	name, dist, ok := hexToName("#740C08")
	if !ok {
		t.Fatal("expected match")
	}
	if name != "Garnet Sunrise 3" {
		t.Errorf("got %q, want %q", name, "Garnet Sunrise 3")
	}
	if dist != 0 {
		t.Errorf("expected exact match (dist 0), got %f", dist)
	}
}

func TestHexToName_Close(t *testing.T) {
	name, dist, ok := hexToName("#740C09")
	if !ok {
		t.Fatal("expected match")
	}
	if name != "Garnet Sunrise 3" {
		t.Errorf("got %q, want %q", name, "Garnet Sunrise 3")
	}
	if dist == 0 {
		t.Log("unexpected exact match for approximate hex")
	}
}

func TestHexToName_InvalidHex(t *testing.T) {
	_, _, ok := hexToName("nothex")
	if ok {
		t.Error("expected no match for invalid hex")
	}
}
