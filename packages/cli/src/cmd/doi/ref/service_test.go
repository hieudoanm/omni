package ref

import (
	"bytes"
	"io"
	"os"
	"strings"
	"testing"

	"github.com/spf13/cobra"
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

func TestRunRef(t *testing.T) {
	cmd := &cobra.Command{}
	cmd.Flags().Bool("json", false, "")
	output := captureCmdOutput(t, func() error {
		return runRef(cmd, []string{"10.1038/nature12373"})
	})
	if !strings.Contains(output, "APA:") {
		t.Errorf("expected APA reference output, got %q", output)
	}
}

func TestRunRef_NoArgs(t *testing.T) {
	err := runRef(&cobra.Command{}, []string{})
	if err == nil {
		t.Error("expected error when no args")
	}
}

func TestRunRef_FetchError(t *testing.T) {
	err := runRef(&cobra.Command{}, []string{"10.9999/invalid-doi-test-12345"})
	if err == nil {
		t.Error("expected error for non-existent DOI")
	}
}
