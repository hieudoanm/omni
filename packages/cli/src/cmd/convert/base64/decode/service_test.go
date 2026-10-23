package decode_test

import (
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/convert/base64/decode"
)

func TestRun(t *testing.T) {
	cmd := decode.NewCmd()
	var buf strings.Builder
	cmd.SetOut(&buf)
	if err := decode.Run(cmd, []string{"aGVsbG8="}, "", ""); err != nil {
		t.Fatal(err)
	}
	got := strings.TrimSpace(buf.String())
	if got != "hello" {
		t.Errorf("Run = %q, want %q", got, "hello")
	}
}

func TestRun_json(t *testing.T) {
	cmd := decode.NewCmd()
	cmd.Flags().Bool("json", false, "JSON output")
	cmd.Flags().Set("json", "true")
	var buf strings.Builder
	cmd.SetOut(&buf)
	if err := decode.Run(cmd, []string{"aGVsbG8="}, "", ""); err != nil {
		t.Fatal(err)
	}
	got := strings.TrimSpace(buf.String())
	if !strings.HasPrefix(got, "{") {
		t.Errorf("expected JSON output, got %q", got)
	}
}

func TestRun_file(t *testing.T) {
	dir := t.TempDir()
	filePath := filepath.Join(dir, "encoded.txt")
	if err := os.WriteFile(filePath, []byte("aGVsbG8="), 0644); err != nil {
		t.Fatal(err)
	}

	cmd := decode.NewCmd()
	var buf strings.Builder
	cmd.SetOut(&buf)
	if err := decode.Run(cmd, nil, filePath, ""); err != nil {
		t.Fatal(err)
	}
	got := strings.TrimSpace(buf.String())
	if got != "hello" {
		t.Errorf("Run = %q, want %q", got, "hello")
	}
}

func TestRun_fileNotFound(t *testing.T) {
	cmd := decode.NewCmd()
	err := decode.Run(cmd, nil, "/nonexistent/file.txt", "")
	if err == nil {
		t.Fatal("expected error")
	}
}

func TestRun_outputFile(t *testing.T) {
	dir := t.TempDir()
	outPath := filepath.Join(dir, "decoded.txt")

	cmd := decode.NewCmd()
	if err := decode.Run(cmd, []string{"aGVsbG8="}, "", outPath); err != nil {
		t.Fatal(err)
	}

	data, err := os.ReadFile(outPath)
	if err != nil {
		t.Fatal(err)
	}
	if string(data) != "hello" {
		t.Errorf("output = %q, want %q", string(data), "hello")
	}
}

func TestRun_dataURL(t *testing.T) {
	cmd := decode.NewCmd()
	var buf strings.Builder
	cmd.SetOut(&buf)
	if err := decode.Run(cmd, []string{"data:image/png;base64,aGVsbG8="}, "", ""); err != nil {
		t.Fatal(err)
	}
	got := strings.TrimSpace(buf.String())
	if got != "hello" {
		t.Errorf("Run = %q, want %q", got, "hello")
	}
}
