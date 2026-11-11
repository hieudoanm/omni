package fetch

import (
	"bytes"
	"io"
	"os"
	"strings"
	"testing"
)

func captureCmdOutput(t *testing.T, fn func() error) string {
	t.Helper()
	old := os.Stdout
	r, w, _ := os.Pipe()
	os.Stdout = w

	err := fn()

	w.Close()
	os.Stdout = old
	var buf bytes.Buffer
	io.Copy(&buf, r)

	if err != nil {
		t.Skipf("skipping network test: %v", err)
	}
	return buf.String()
}

func TestRunFetch(t *testing.T) {
	output := captureCmdOutput(t, func() error {
		return runFetch(nil, []string{"10.1038/nature12373"})
	})
	if !strings.Contains(output, "status") {
		t.Errorf("expected JSON output, got %q", output)
	}
}

func TestRunFetch_NoArgs(t *testing.T) {
	err := runFetch(nil, []string{})
	if err == nil {
		t.Error("expected error when no args")
	}
}

func TestRunFetch_FetchError(t *testing.T) {
	err := runFetch(nil, []string{"10.9999/invalid-doi-test-12345"})
	if err == nil {
		t.Error("expected error for non-existent DOI")
	}
}
