package decode

import (
	"bytes"
	"io"
	"os"
	"reflect"
	"strings"
	"testing"
)

func TestSplitJWT_threeParts(t *testing.T) {
	parts := splitJWT("header.payload.signature")
	want := []string{"header", "payload"}
	if !reflect.DeepEqual(parts, want) {
		t.Errorf("got %v, want %v", parts, want)
	}
}

func TestSplitJWT_twoParts(t *testing.T) {
	parts := splitJWT("header.payload")
	want := []string{"header.payload"}
	if !reflect.DeepEqual(parts, want) {
		t.Errorf("got %v, want %v", parts, want)
	}
}

func TestSplitJWT_empty(t *testing.T) {
	parts := splitJWT("")
	want := []string{""}
	if !reflect.DeepEqual(parts, want) {
		t.Errorf("got %v, want %v", parts, want)
	}
}

func TestSplitJWT_noDots(t *testing.T) {
	parts := splitJWT("justatext")
	want := []string{"justatext"}
	if !reflect.DeepEqual(parts, want) {
		t.Errorf("got %v, want %v", parts, want)
	}
}

func TestSplitJWT_fourParts(t *testing.T) {
	parts := splitJWT("a.b.c.d")
	want := []string{"a", "b"}
	if !reflect.DeepEqual(parts, want) {
		t.Errorf("got %v, want %v", parts, want)
	}
}

func TestSplitJWT_singleDot(t *testing.T) {
	parts := splitJWT("a.b")
	want := []string{"a.b"}
	if !reflect.DeepEqual(parts, want) {
		t.Errorf("got %v, want %v", parts, want)
	}
}

func TestSplitJWT_doubleDot(t *testing.T) {
	parts := splitJWT("a..b")
	want := []string{"a", ""}
	if !reflect.DeepEqual(parts, want) {
		t.Errorf("got %v, want %v", parts, want)
	}
}

func TestSplitJWT_trailingDot(t *testing.T) {
	parts := splitJWT("a.b.c.")
	want := []string{"a", "b"}
	if !reflect.DeepEqual(parts, want) {
		t.Errorf("got %v, want %v", parts, want)
	}
}

func TestSplitJWT_leadingDot(t *testing.T) {
	parts := splitJWT(".a.b")
	want := []string{"", "a"}
	if !reflect.DeepEqual(parts, want) {
		t.Errorf("got %v, want %v", parts, want)
	}
}

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

const validToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJuYW1lIjoiSm9obiIsImFkbWluIjp0cnVlfQ.ZHVtbXk"

func TestRunDecode(t *testing.T) {
	output := captureOutput(func() {
		if err := runDecode(validToken, false); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "HS256") {
		t.Errorf("expected HS256 in output, got: %s", output)
	}
	if !strings.Contains(output, "John") {
		t.Errorf("expected John in output, got: %s", output)
	}
}

func TestRunDecodeJSON(t *testing.T) {
	output := captureOutput(func() {
		if err := runDecode(validToken, true); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "HS256") {
		t.Errorf("expected HS256 in JSON output, got: %s", output)
	}
	if !strings.Contains(output, "John") {
		t.Errorf("expected John in JSON output, got: %s", output)
	}
}

func TestRunDecodeInvalidToken(t *testing.T) {
	err := runDecode("not-a-jwt", false)
	if err == nil {
		t.Fatal("expected error for invalid token")
	}
}

func TestNewCmd_RunE(t *testing.T) {
	output := captureOutput(func() {
		cmd := NewCmd()
		cmd.SetArgs([]string{"--token", validToken})
		if err := cmd.Execute(); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "HS256") {
		t.Errorf("expected HS256 in output, got: %s", output)
	}
}

func TestNewCmd_RunE_JSON(t *testing.T) {
	output := captureOutput(func() {
		cmd := NewCmd()
		cmd.SetArgs([]string{"--token", validToken, "--json"})
		if err := cmd.Execute(); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "HS256") {
		t.Errorf("expected HS256 in JSON output, got: %s", output)
	}
}
