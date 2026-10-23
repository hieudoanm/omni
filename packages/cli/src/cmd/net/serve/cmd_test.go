package serve

import (
	"testing"
)

func TestNewServeCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "serve" {
		t.Errorf("Use = %q", cmd.Use)
	}
	if cmd.Short != "Start an HTTP file server" {
		t.Errorf("Short = %q", cmd.Short)
	}
	wantLong := "Serve static files over HTTP with optional CORS, directory listing, and TLS support."
	if cmd.Long != wantLong {
		t.Errorf("Long = %q, want %q", cmd.Long, wantLong)
	}
	wantExample := "  serve\n  serve --port 9000 --dir ./public\n  serve --port 443 --cert cert.pem --key key.pem"
	if cmd.Example != wantExample {
		t.Errorf("Example = %q, want %q", cmd.Example, wantExample)
	}
	for _, name := range []string{"port", "dir", "cors", "cert", "key", "json"} {
		if cmd.Flag(name) == nil {
			t.Errorf("missing flag: --%s", name)
		}
	}
}
