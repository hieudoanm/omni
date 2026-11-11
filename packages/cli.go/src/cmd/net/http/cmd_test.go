package http

import (
	"testing"
)

func TestNewHTTPCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "http [--url <url>]" {
		t.Errorf("Use = %q", cmd.Use)
	}
	if cmd.Short != "Make HTTP requests" {
		t.Errorf("Short = %q", cmd.Short)
	}
	wantLong := "Make HTTP GET, POST, PUT, DELETE requests to URLs."
	if cmd.Long != wantLong {
		t.Errorf("Long = %q, want %q", cmd.Long, wantLong)
	}
	wantExample := "  net http --url https://api.example.com/data\n  net http --url https://api.example.com --method POST --data '{\"key\":\"value\"}'\n  net http --url https://api.example.com/resource/1 --method DELETE\n  net http --url https://api.example.com --header \"Authorization: Bearer token\""
	if cmd.Example != wantExample {
		t.Errorf("Example = %q, want %q", cmd.Example, wantExample)
	}
	for _, name := range []string{"url", "method", "data", "header", "json"} {
		if cmd.Flag(name) == nil {
			t.Errorf("missing flag: --%s", name)
		}
	}
}
