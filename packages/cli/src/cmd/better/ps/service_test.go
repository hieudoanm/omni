package ps

import (
	"io"
	"os"
	"os/exec"
	"strings"
	"testing"
)

func capturePSOutput(t *testing.T, all bool, sortBy string, long, human, json bool) string {
	t.Helper()
	origExec := execCommand
	execCommand = func(name string, arg ...string) *exec.Cmd {
		return exec.Command("echo", "  PID PPID %CPU %MEM  RSS    VSZ STAT COMMAND\n  1234    0  5.6  7.8 1024 65536 S    nginx\n  5678    1  0.0  1.2  512 32768 R    zsh")
	}
	defer func() { execCommand = origExec }()

	r, w, _ := os.Pipe()
	orig := os.Stdout
	os.Stdout = w

	err := run(all, sortBy, long, human, json)

	w.Close()
	os.Stdout = orig
	out, _ := io.ReadAll(r)

	if err != nil {
		t.Fatal(err)
	}
	return string(out)
}

func TestRunShort(t *testing.T) {
	out := capturePSOutput(t, false, "pid", false, false, false)
	if !strings.Contains(out, "PID") || !strings.Contains(out, "CPU%") || !strings.Contains(out, "MEM%") {
		t.Errorf("expected short format headers, got:\n%s", out)
	}
}

func TestRunLong(t *testing.T) {
	out := capturePSOutput(t, false, "pid", true, false, false)
	for _, col := range []string{"PID", "PPID", "CPU%", "MEM%", "RSS", "VSZ", "STAT"} {
		if !strings.Contains(out, col) {
			t.Errorf("expected column %q in long output, got:\n%s", col, out)
		}
	}
}

func TestRunJSON(t *testing.T) {
	out := capturePSOutput(t, false, "pid", false, false, true)
	if !strings.Contains(out, `"pid": 1234`) {
		t.Errorf("expected JSON with pid 1234, got:\n%s", out)
	}
	if !strings.Contains(out, `"count"`) {
		t.Errorf("expected count field, got:\n%s", out)
	}
}

func TestRunExecError(t *testing.T) {
	origExec := execCommand
	execCommand = func(name string, arg ...string) *exec.Cmd {
		return exec.Command("false")
	}
	defer func() { execCommand = origExec }()

	err := run(false, "pid", false, false, false)
	if err == nil {
		t.Error("expected error from failing execCommand")
	}
}

func TestPrintTable(t *testing.T) {
	r, w, _ := os.Pipe()
	orig := os.Stdout
	os.Stdout = w

	err := printTable([]string{"A", "B"}, [][]string{{"1", "2"}})
	if err != nil {
		t.Fatal(err)
	}

	w.Close()
	os.Stdout = orig
	out, _ := io.ReadAll(r)

	output := string(out)
	if !strings.Contains(output, "A") || !strings.Contains(output, "B") {
		t.Errorf("expected headers in output, got:\n%s", output)
	}
	if !strings.Contains(output, "1") || !strings.Contains(output, "2") {
		t.Errorf("expected data in output, got:\n%s", output)
	}
}

func TestHumanSize(t *testing.T) {
	tests := []struct {
		input int64
		want  string
	}{
		{0, "0B"},
		{100, "100B"},
		{1024, "1.0K"},
		{2048, "2.0K"},
		{1048576, "1.0M"},
		{1073741824, "1.0G"},
		{1099511627776, "1.0T"},
	}
	for _, tt := range tests {
		t.Run(tt.want, func(t *testing.T) {
			got := humanSize(tt.input)
			if got != tt.want {
				t.Errorf("humanSize(%d) = %q, want %q", tt.input, got, tt.want)
			}
		})
	}
}

func FuzzSplitPSLine(f *testing.F) {
	f.Add("  1234    0  5.6  7.8 1024 65536 S    nginx")
	f.Add("  5678    1  0.0  1.2  512 32768 R    zsh with args")
	f.Fuzz(func(t *testing.T, line string) {
		fields := splitPSLine(line)
		if len(fields) > 0 && len(fields) < 8 {
			t.Errorf("splitPSLine returned %d fields for %q", len(fields), line)
		}
	})
}
