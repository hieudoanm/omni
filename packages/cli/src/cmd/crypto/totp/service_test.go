package totp

import (
	"bytes"
	"io"
	"os"
	"strings"
	"testing"
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

func TestCmd_RunE(t *testing.T) {
	cmd := NewCommand()
	cmd.Flags().Set("secret", "JBSWY3DPEHPK3PXP")
	cmd.Flags().Set("time", "2024-01-01T00:00:00Z")

	output := captureOutput(func() {
		if err := cmd.RunE(cmd, []string{}); err != nil {
			t.Fatal(err)
		}
	})

	output = strings.TrimSpace(output)
	if len(output) != 6 {
		t.Errorf("expected 6-digit TOTP code, got %q", output)
	}
}
