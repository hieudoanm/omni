package count_test

import (
	"os"
	"strings"
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/convert/count"
)

func TestRun(t *testing.T) {
	cmd := count.NewCommand()
	var buf strings.Builder
	cmd.SetOut(&buf)
	if err := count.Run(cmd, []string{"hello world"}); err != nil {
		t.Fatal(err)
	}
	got := strings.TrimSpace(buf.String())
	parts := strings.Fields(got)
	if len(parts) != 3 {
		t.Fatalf("expected 3 fields, got %d: %q", len(parts), got)
	}
	if parts[0] != "1" {
		t.Errorf("lines = %s, want 1", parts[0])
	}
	if parts[1] != "2" {
		t.Errorf("words = %s, want 2", parts[1])
	}
	if parts[2] != "11" {
		t.Errorf("chars = %s, want 11", parts[2])
	}
}

func TestRun_Empty(t *testing.T) {
	cmd := count.NewCommand()
	var buf strings.Builder
	cmd.SetOut(&buf)
	if err := count.Run(cmd, []string{""}); err != nil {
		t.Fatal(err)
	}
	got := strings.TrimSpace(buf.String())
	parts := strings.Fields(got)
	if len(parts) != 3 {
		t.Fatalf("expected 3 fields, got %d: %q", len(parts), got)
	}
	if parts[0] != "0" {
		t.Errorf("lines = %s, want 0", parts[0])
	}
	if parts[1] != "0" {
		t.Errorf("words = %s, want 0", parts[1])
	}
	if parts[2] != "0" {
		t.Errorf("chars = %s, want 0", parts[2])
	}
}

func TestRun_JSON(t *testing.T) {
	cmd := count.NewCommand()
	cmd.Flags().Bool("json", false, "JSON output")
	cmd.Flags().Set("json", "true")
	var buf strings.Builder
	cmd.SetOut(&buf)
	if err := count.Run(cmd, []string{"hello world"}); err != nil {
		t.Fatal(err)
	}
	got := strings.TrimSpace(buf.String())
	if !strings.HasPrefix(got, "{") || !strings.Contains(got, "lines") {
		t.Errorf("expected JSON output with lines field, got %q", got)
	}
}

func TestRun_MultiLine(t *testing.T) {
	cmd := count.NewCommand()
	var buf strings.Builder
	cmd.SetOut(&buf)
	if err := count.Run(cmd, []string{"hello\nworld\nfoo"}); err != nil {
		t.Fatal(err)
	}
	got := strings.TrimSpace(buf.String())
	parts := strings.Fields(got)
	if parts[0] != "3" {
		t.Errorf("lines = %s, want 3", parts[0])
	}
	if parts[1] != "3" {
		t.Errorf("words = %s, want 3", parts[1])
	}
	if parts[2] != "15" {
		t.Errorf("chars = %s, want 15", parts[2])
	}
}

func TestRun_Stdin(t *testing.T) {
	oldStdin := os.Stdin
	r, w, _ := os.Pipe()
	w.Write([]byte("hello world\nsecond line"))
	w.Close()
	os.Stdin = r
	defer func() { os.Stdin = oldStdin }()

	cmd := count.NewCommand()
	var buf strings.Builder
	cmd.SetOut(&buf)
	if err := count.Run(cmd, []string{}); err != nil {
		t.Fatal(err)
	}
	got := strings.TrimSpace(buf.String())
	parts := strings.Fields(got)
	if parts[0] != "2" {
		t.Errorf("lines = %s, want 2", parts[0])
	}
	if parts[1] != "4" {
		t.Errorf("words = %s, want 4", parts[1])
	}
	if parts[2] != "23" {
		t.Errorf("chars = %s, want 23", parts[2])
	}
}
