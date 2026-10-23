package cite

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

func TestRunCite(t *testing.T) {
	cmd := &cobra.Command{}
	cmd.Flags().Bool("json", false, "")
	output := captureCmdOutput(t, func() error {
		return runCite(cmd, []string{"10.1038/nature12373"})
	})
	if !strings.Contains(output, "Cite:") {
		t.Errorf("expected citation output, got %q", output)
	}
}

func TestRunCite_NoArgs(t *testing.T) {
	err := runCite(&cobra.Command{}, []string{})
	if err == nil {
		t.Error("expected error when no args")
	}
}

func TestRunCite_FetchError(t *testing.T) {
	err := runCite(&cobra.Command{}, []string{"10.9999/invalid-doi-test-12345"})
	if err == nil {
		t.Error("expected error for non-existent DOI")
	}
}
