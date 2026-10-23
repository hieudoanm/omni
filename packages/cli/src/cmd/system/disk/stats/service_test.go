package stats

import (
	"io"
	"os"
	"strings"
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/system/disk/internal"
)

func captureOutput(fn func()) string {
	r, w, _ := os.Pipe()
	orig := os.Stdout
	os.Stdout = w
	fn()
	w.Close()
	out, _ := io.ReadAll(r)
	os.Stdout = orig
	return strings.TrimRight(string(out), "\n")
}

func TestStatsRun(t *testing.T) {
	output := captureOutput(func() {
		if err := statsRun(false); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "/") {
		t.Errorf("expected partition info in output, got %q", output)
	}
}

func TestStatsRun_All(t *testing.T) {
	output := captureOutput(func() {
		if err := statsRun(true); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "/") {
		t.Errorf("expected output with --all, got %q", output)
	}
}

func TestDiskLabel(t *testing.T) {
	tests := []struct {
		bytes uint64
		want  string
	}{
		{0, "0 B"},
		{500, "500 B"},
		{1024, "1.0 KB"},
		{1536, "1.5 KB"},
		{1048576, "1.0 MB"},
		{1073741824, "1.0 GB"},
	}

	for _, tt := range tests {
		got := internal.DiskLabel(tt.bytes)
		if got != tt.want {
			t.Errorf("DiskLabel(%d) = %q, want %q", tt.bytes, got, tt.want)
		}
	}
}
