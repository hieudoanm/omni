package weather

import (
	"strings"
	"testing"
)

func TestNewCmd_Structure(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "weather [city]" {
		t.Errorf("Use = %q, want 'weather [city]'", cmd.Use)
	}
	if cmd.Short != "Check current weather for a city" {
		t.Errorf("Short = %q", cmd.Short)
	}
	if cmd.Flag("forecast") == nil {
		t.Error("expected --forecast flag")
	}
	if cmd.Flag("units") == nil {
		t.Error("expected --units flag")
	}
}

func TestNewCmd_RunE_NoCity(t *testing.T) {
	cmd := NewCmd()
	cmd.SetArgs([]string{"--forecast"})
	err := cmd.Execute()
	if err == nil {
		t.Fatal("expected error")
	}
	if !strings.Contains(err.Error(), "provide a city name") {
		t.Errorf("expected 'provide a city name' error, got %v", err)
	}
}
