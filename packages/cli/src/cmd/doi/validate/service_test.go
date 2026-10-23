package validate

import (
	"bytes"
	"io"
	"os"
	"strings"
	"testing"

	"github.com/spf13/cobra"
)

func captureStdout(fn func()) string {
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

func TestRunValidate_ValidDOI(t *testing.T) {
	cmd := &cobra.Command{}
	output := captureStdout(func() {
		if err := runValidate(cmd, []string{"10.1000/xyz123"}); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "valid DOI") {
		t.Errorf("expected valid DOI message, got %q", output)
	}
}

func TestRunValidate_InvalidDOI(t *testing.T) {
	cmd := &cobra.Command{}
	output := captureStdout(func() {
		if err := runValidate(cmd, []string{"not-a-doi"}); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "not a valid DOI") {
		t.Errorf("expected invalid DOI message, got %q", output)
	}
}

func TestRunValidate_NoArgs(t *testing.T) {
	cmd := &cobra.Command{}
	output := captureStdout(func() {
		if err := runValidate(cmd, []string{}); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "Usage: doi validate") {
		t.Errorf("expected usage message, got %q", output)
	}
}

func TestRunValidate_EmptyString(t *testing.T) {
	cmd := &cobra.Command{}
	output := captureStdout(func() {
		if err := runValidate(cmd, []string{""}); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "not a valid DOI") {
		t.Errorf("expected invalid DOI message for empty string, got %q", output)
	}
}
