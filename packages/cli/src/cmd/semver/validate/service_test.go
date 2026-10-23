package validate

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

func TestRunValidateValid(t *testing.T) {
	output := captureOutput(func() {
		if err := runValidate([]string{"1.2.3"}, false); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "valid") {
		t.Errorf("expected 'valid', got: %s", output)
	}
}

func TestRunValidateMultipleValid(t *testing.T) {
	output := captureOutput(func() {
		if err := runValidate([]string{"1.2.3", "2.0.0", "v3.0.0"}, false); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "valid") {
		t.Errorf("expected 'valid', got: %s", output)
	}
}

func TestRunValidateInvalid(t *testing.T) {
	output := captureOutput(func() {
		if err := runValidate([]string{"abc"}, false); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "invalid") {
		t.Errorf("expected 'invalid', got: %s", output)
	}
}

func TestRunValidateNoVersions(t *testing.T) {
	err := runValidate(nil, false)
	if err == nil {
		t.Error("expected error when no versions provided")
	}
}

func TestRunValidateJSON(t *testing.T) {
	output := captureOutput(func() {
		if err := runValidate([]string{"1.0.0", "abc"}, true); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, `"valid": true`) {
		t.Errorf("expected valid=true in JSON, got: %s", output)
	}
}
