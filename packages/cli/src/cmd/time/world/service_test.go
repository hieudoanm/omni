package world

import (
	"bytes"
	"io"
	"os"
	"strings"
	"testing"
	"time"
)

func captureOutput(fn func()) string {
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

func TestRunWorld_DefaultZones(t *testing.T) {
	output := captureOutput(func() {
		if err := runWorld([]string{}); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "ny:") {
		t.Errorf("expected ny timezone, got: %s", output)
	}
	if !strings.Contains(output, "utc:") {
		t.Errorf("expected utc timezone, got: %s", output)
	}
}

func TestRunWorld_CustomZones(t *testing.T) {
	output := captureOutput(func() {
		if err := runWorld([]string{"london", "tokyo"}); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "london:") {
		t.Errorf("expected london timezone, got: %s", output)
	}
	if !strings.Contains(output, "tokyo:") {
		t.Errorf("expected tokyo timezone, got: %s", output)
	}
}

func TestRunWorld_InvalidZone(t *testing.T) {
	err := runWorld([]string{"invalid_zone_xyz"})
	if err == nil {
		t.Fatal("expected error for invalid timezone")
	}
}

func TestCommonZonesHasExpectedEntries(t *testing.T) {
	expected := map[string]string{
		"utc":    "UTC",
		"ny":     "America/New_York",
		"london": "Europe/London",
		"tokyo":  "Asia/Tokyo",
		"hcmc":   "Asia/Ho_Chi_Minh",
	}
	for alias, zone := range expected {
		got, ok := commonZones[alias]
		if !ok {
			t.Errorf("commonZones missing entry for %q", alias)
			continue
		}
		if got != zone {
			t.Errorf("commonZones[%q] = %q, want %q", alias, got, zone)
		}
	}
}

func TestCommonZonesHasAdditionalEntries(t *testing.T) {
	additional := []string{"hanoi", "sf", "la", "paris", "berlin", "mumbai", "beijing", "seoul", "sydney", "dubai", "singapore", "hk", "ams", "chi", "den", "phx"}
	for _, alias := range additional {
		if _, ok := commonZones[alias]; !ok {
			t.Errorf("commonZones missing expected entry for %q", alias)
		}
	}
}

func TestLoadLocationAliasUTC(t *testing.T) {
	loc, err := loadLocation("utc")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if loc.String() != "UTC" {
		t.Errorf("expected 'UTC', got %q", loc.String())
	}
}

func TestLoadLocationAliasNY(t *testing.T) {
	loc, err := loadLocation("ny")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if loc.String() != "America/New_York" {
		t.Errorf("expected 'America/New_York', got %q", loc.String())
	}
}

func TestLoadLocationDirect(t *testing.T) {
	loc, err := loadLocation("Europe/Paris")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if loc.String() != "Europe/Paris" {
		t.Errorf("expected 'Europe/Paris', got %q", loc.String())
	}
}

func TestLoadLocationUnknown(t *testing.T) {
	_, err := loadLocation("mars/olympus")
	if err == nil {
		t.Fatal("expected error for unknown location")
	}
}

func TestCommonZonesNoEmptyValues(t *testing.T) {
	for alias, zone := range commonZones {
		if alias == "" || zone == "" {
			t.Errorf("empty alias or zone in commonZones: %q -> %q", alias, zone)
		}
	}
}

func TestLoadLocationAfterLoad(t *testing.T) {
	loc, err := loadLocation("America/New_York")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	now := time.Now().In(loc)
	if now.Location().String() != "America/New_York" {
		t.Errorf("expected location 'America/New_York', got %q", now.Location().String())
	}
}
