package encode

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
	cmd := NewCmd()
	cmd.Flags().Set("key", "secret")
	cmd.Flags().Set("claims", `{"sub":"123","name":"test"}`)

	output := captureOutput(func() {
		if err := cmd.RunE(cmd, []string{}); err != nil {
			t.Fatal(err)
		}
	})

	output = strings.TrimSpace(output)
	if !strings.Contains(output, ".") {
		t.Error("expected JWT token with dot separators")
	}
	parts := strings.Split(output, ".")
	if len(parts) != 3 {
		t.Errorf("expected 3 JWT segments, got %d", len(parts))
	}
}

func TestCmd_RunE_HS384(t *testing.T) {
	cmd := NewCmd()
	cmd.Flags().Set("algorithm", "HS384")
	cmd.Flags().Set("key", "mysecret")
	cmd.Flags().Set("claims", `{"sub":"123"}`)

	output := captureOutput(func() {
		if err := cmd.RunE(cmd, []string{}); err != nil {
			t.Fatal(err)
		}
	})
	output = strings.TrimSpace(output)
	if !strings.Contains(output, ".") {
		t.Error("expected JWT token with dot separators")
	}
	parts := strings.Split(output, ".")
	if len(parts) != 3 {
		t.Errorf("expected 3 JWT segments, got %d", len(parts))
	}
}

func TestCmd_RunE_HS512(t *testing.T) {
	cmd := NewCmd()
	cmd.Flags().Set("algorithm", "HS512")
	cmd.Flags().Set("key", "mysecret")
	cmd.Flags().Set("claims", `{"sub":"123"}`)

	output := captureOutput(func() {
		if err := cmd.RunE(cmd, []string{}); err != nil {
			t.Fatal(err)
		}
	})
	output = strings.TrimSpace(output)
	if !strings.Contains(output, ".") {
		t.Error("expected JWT token with dot separators")
	}
}

func TestCmd_RunE_InvalidAlgorithm(t *testing.T) {
	cmd := NewCmd()
	cmd.Flags().Set("algorithm", "RS256")
	cmd.Flags().Set("key", "mysecret")
	cmd.Flags().Set("claims", `{"sub":"123"}`)

	err := cmd.RunE(cmd, []string{})
	if err == nil {
		t.Fatal("expected error for unsupported algorithm")
	}
	if !strings.Contains(err.Error(), "unsupported algorithm") {
		t.Errorf("expected unsupported algorithm error, got %v", err)
	}
}

func TestRunEncode_JSON(t *testing.T) {
	output := captureOutput(func() {
		if err := runEncode("HS256", "secret", `{"sub":"123"}`, true); err != nil {
			t.Fatal(err)
		}
	})

	if !strings.Contains(output, "token") {
		t.Errorf("expected json output with 'token' key, got: %s", output)
	}
}

func TestCmd_RunE_InvalidClaims(t *testing.T) {
	cmd := NewCmd()
	cmd.Flags().Set("key", "mysecret")
	cmd.Flags().Set("claims", "not-json")

	err := cmd.RunE(cmd, []string{})
	if err == nil {
		t.Fatal("expected error for invalid claims")
	}
	if !strings.Contains(err.Error(), "invalid claims JSON") {
		t.Errorf("expected invalid claims JSON error, got %v", err)
	}
}
