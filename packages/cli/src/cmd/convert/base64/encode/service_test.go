package encode_test

import (
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/convert/base64/encode"
)

func TestRun(t *testing.T) {
	cmd := encode.NewCmd()
	var buf strings.Builder
	cmd.SetOut(&buf)
	if err := encode.Run(cmd, []string{"hello"}, "", ""); err != nil {
		t.Fatal(err)
	}
	got := strings.TrimSpace(buf.String())
	if got != "aGVsbG8=" {
		t.Errorf("Run = %q, want %q", got, "aGVsbG8=")
	}
}

func TestRun_json(t *testing.T) {
	cmd := encode.NewCmd()
	cmd.Flags().Bool("json", false, "JSON output")
	cmd.Flags().Set("json", "true")
	var buf strings.Builder
	cmd.SetOut(&buf)
	if err := encode.Run(cmd, []string{"hello"}, "", ""); err != nil {
		t.Fatal(err)
	}
	got := strings.TrimSpace(buf.String())
	if !strings.HasPrefix(got, "{") {
		t.Errorf("expected JSON output, got %q", got)
	}
}

func TestRun_file(t *testing.T) {
	dir := t.TempDir()
	filePath := filepath.Join(dir, "input.txt")
	if err := os.WriteFile(filePath, []byte("hello"), 0644); err != nil {
		t.Fatal(err)
	}

	cmd := encode.NewCmd()
	var buf strings.Builder
	cmd.SetOut(&buf)
	if err := encode.Run(cmd, nil, filePath, ""); err != nil {
		t.Fatal(err)
	}
	got := strings.TrimSpace(buf.String())
	if got != "aGVsbG8=" {
		t.Errorf("Run = %q, want %q", got, "aGVsbG8=")
	}
}

func TestRun_fileNotFound(t *testing.T) {
	cmd := encode.NewCmd()
	err := encode.Run(cmd, nil, "/nonexistent/file.txt", "")
	if err == nil {
		t.Fatal("expected error")
	}
}

func TestRun_outputFile(t *testing.T) {
	dir := t.TempDir()
	outPath := filepath.Join(dir, "encoded.txt")

	cmd := encode.NewCmd()
	if err := encode.Run(cmd, []string{"hello"}, "", outPath); err != nil {
		t.Fatal(err)
	}

	data, err := os.ReadFile(outPath)
	if err != nil {
		t.Fatal(err)
	}
	if string(data) != "aGVsbG8=" {
		t.Errorf("output = %q, want %q", string(data), "aGVsbG8=")
	}
}
