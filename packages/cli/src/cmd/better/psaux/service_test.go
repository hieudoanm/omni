package psaux

import (
	"io"
	"os"
	"os/exec"
	"strings"
	"testing"
)

const fakePSAuxOutput = `USER               PID  %CPU %MEM      RSS      VSZ TTY STAT STARTED      TIME COMMAND
root                 1   0.0  0.1     1024    65536 ??  Ss   Sat Jun 27 0:00.01 launchd
hieudoan         1234   5.6  7.8    65536   262144 s000 S    Sun Jun 28 0:03.45 zsh
hieudoan         5678   0.0  1.2    32768   131072 s001 R+   Sun Jun 28 0:00.23 nginx`

func capturePSAuxOutput(t *testing.T, sortBy, user string, json bool) string {
	t.Helper()
	origExec := execCommand
	execCommand = func(name string, arg ...string) *exec.Cmd {
		return exec.Command("echo", fakePSAuxOutput)
	}
	defer func() { execCommand = origExec }()

	r, w, _ := os.Pipe()
	orig := os.Stdout
	os.Stdout = w

	err := run(sortBy, user, json)

	w.Close()
	os.Stdout = orig
	out, _ := io.ReadAll(r)

	if err != nil {
		t.Fatal(err)
	}
	return string(out)
}

func TestRun(t *testing.T) {
	out := capturePSAuxOutput(t, "pid", "", false)
	for _, col := range []string{"USER", "PID", "CPU%", "MEM%", "RSS", "VSZ", "STAT", "TIME", "COMMAND"} {
		if !strings.Contains(out, col) {
			t.Errorf("expected column %q in output, got:\n%s", col, out)
		}
	}
	if !strings.Contains(out, "zsh") || !strings.Contains(out, "nginx") {
		t.Errorf("expected processes in output, got:\n%s", out)
	}
}

func TestRunJSON(t *testing.T) {
	out := capturePSAuxOutput(t, "pid", "", true)
	if !strings.Contains(out, `"pid": 1234`) {
		t.Errorf("expected JSON with pid 1234, got:\n%s", out)
	}
	if !strings.Contains(out, `"count"`) {
		t.Errorf("expected count field, got:\n%s", out)
	}
}

func TestRunUserFilter(t *testing.T) {
	out := capturePSAuxOutput(t, "pid", "root", false)
	if !strings.Contains(out, "launchd") {
		t.Errorf("expected launchd for root user, got:\n%s", out)
	}
	if strings.Contains(out, "zsh") {
		t.Errorf("did not expect zsh for root user, got:\n%s", out)
	}
}

func TestRunSortByCPU(t *testing.T) {
	out := capturePSAuxOutput(t, "cpu", "", false)
	if !strings.Contains(out, "CPU%") {
		t.Errorf("expected CPU column in output, got:\n%s", out)
	}
}

func TestRunExecError(t *testing.T) {
	origExec := execCommand
	execCommand = func(name string, arg ...string) *exec.Cmd {
		return exec.Command("false")
	}
	defer func() { execCommand = origExec }()

	err := run("pid", "", false)
	if err == nil {
		t.Error("expected error from failing execCommand")
	}
}

func TestPrintTable(t *testing.T) {
	r, w, _ := os.Pipe()
	orig := os.Stdout
	os.Stdout = w

	err := printTable([]string{"USER", "PID"}, [][]string{{"root", "1"}})
	if err != nil {
		t.Fatal(err)
	}

	w.Close()
	os.Stdout = orig
	out, _ := io.ReadAll(r)

	output := string(out)
	if !strings.Contains(output, "USER") || !strings.Contains(output, "PID") {
		t.Errorf("expected headers in output, got:\n%s", output)
	}
}

func TestHumanSize(t *testing.T) {
	tests := []struct {
		input int64
		want  string
	}{
		{0, "0B"},
		{500, "500B"},
		{1024, "1.0K"},
		{1048576, "1.0M"},
		{1073741824, "1.0G"},
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
