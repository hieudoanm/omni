package info

import (
	"fmt"
	"io"
	"os"
	"os/exec"
	"strings"
	"testing"
)

func captureOutput(fn func()) string {
	r, w, _ := os.Pipe()
	orig := os.Stdout
	os.Stdout = w
	fn()
	w.Close()
	out, _ := io.ReadAll(r)
	os.Stdout = orig
	return string(out)
}

func TestFormatBytes(t *testing.T) {
	tests := []struct {
		bytes    int64
		expected string
	}{
		{0, "0 B"},
		{100, "100 B"},
		{512, "512 B"},
		{1024, "1.0 KB"},
		{1536, "1.5 KB"},
		{2048, "2.0 KB"},
		{1048576, "1.0 MB"},
		{1073741824, "1.0 GB"},
		{1610612736, "1.5 GB"},
		{1099511627776, "1.0 TB"},
	}

	for _, tt := range tests {
		t.Run(tt.expected, func(t *testing.T) {
			got := formatBytes(tt.bytes)
			if got != tt.expected {
				t.Errorf("formatBytes(%d) = %q, want %q", tt.bytes, got, tt.expected)
			}
		})
	}
}

func TestHostname(t *testing.T) {
	h := hostname()
	if h == "" {
		t.Error("hostname should not be empty")
	}
}

func TestUptime(t *testing.T) {
	u := uptime()
	if u == "" || u == "unknown" {
		t.Errorf("uptime should return a duration string, got %q", u)
	}
}

func TestTotalMemory(t *testing.T) {
	m := totalMemory()
	if m == "" || m == "unknown" {
		t.Errorf("totalMemory should return a memory string, got %q", m)
	}
}

func TestHostname_Error(t *testing.T) {
	orig := osHostname
	osHostname = func() (string, error) {
		return "", fmt.Errorf("hostname error")
	}
	defer func() { osHostname = orig }()

	h := hostname()
	if h != "unknown" {
		t.Errorf("expected 'unknown', got %q", h)
	}
}

func TestUptime_Darwin_ExecError(t *testing.T) {
	origOS := goOS
	goOS = "darwin"
	defer func() { goOS = origOS }()

	orig := execCommand
	execCommand = func(name string, arg ...string) *exec.Cmd {
		return exec.Command("false")
	}
	defer func() { execCommand = orig }()

	u := uptime()
	if u != "unknown" {
		t.Errorf("expected 'unknown' on exec error, got %q", u)
	}
}

func TestUptime_Darwin_ParseSuccess(t *testing.T) {
	origOS := goOS
	goOS = "darwin"
	defer func() { goOS = origOS }()

	orig := execCommand
	execCommand = func(name string, arg ...string) *exec.Cmd {
		return exec.Command("echo", "sec 1234567890, something")
	}
	defer func() { execCommand = orig }()

	u := uptime()
	if u == "unknown" {
		t.Error("uptime should parse successfully")
	}
}

func TestUptime_Darwin_ParseFailure(t *testing.T) {
	origOS := goOS
	goOS = "darwin"
	defer func() { goOS = origOS }()

	orig := execCommand
	execCommand = func(name string, arg ...string) *exec.Cmd {
		return exec.Command("echo", "sec abc, no numbers here")
	}
	defer func() { execCommand = orig }()

	u := uptime()
	if u != "unknown" {
		t.Errorf("expected 'unknown' on parse failure, got %q", u)
	}
}

func TestTotalMemory_Darwin_ExecError(t *testing.T) {
	origOS := goOS
	goOS = "darwin"
	defer func() { goOS = origOS }()

	orig := execCommand
	execCommand = func(name string, arg ...string) *exec.Cmd {
		return exec.Command("false")
	}
	defer func() { execCommand = orig }()

	m := totalMemory()
	if m != "unknown" {
		t.Errorf("expected 'unknown' on exec error, got %q", m)
	}
}

func TestTotalMemory_Darwin_ParseSuccess(t *testing.T) {
	origOS := goOS
	goOS = "darwin"
	defer func() { goOS = origOS }()

	orig := execCommand
	execCommand = func(name string, arg ...string) *exec.Cmd {
		return exec.Command("echo", "17179869184")
	}
	defer func() { execCommand = orig }()

	m := totalMemory()
	if m != "16.0 GB" {
		t.Errorf("totalMemory = %q, want %q", m, "16.0 GB")
	}
}

func TestTotalMemory_Darwin_ParseFailure(t *testing.T) {
	origOS := goOS
	goOS = "darwin"
	defer func() { goOS = origOS }()

	orig := execCommand
	execCommand = func(name string, arg ...string) *exec.Cmd {
		return exec.Command("echo", "not-a-number")
	}
	defer func() { execCommand = orig }()

	m := totalMemory()
	if m != "unknown" {
		t.Errorf("expected 'unknown' on parse failure, got %q", m)
	}
}

func TestUptime_Linux_Success(t *testing.T) {
	origOS := goOS
	goOS = "linux"
	defer func() { goOS = origOS }()

	origRead := osReadFile
	osReadFile = func(name string) ([]byte, error) {
		return []byte("12345.67 98765.43\n"), nil
	}
	defer func() { osReadFile = origRead }()

	u := uptime()
	if u == "unknown" {
		t.Error("uptime should parse linux /proc/uptime format")
	}
}

func TestUptime_Linux_ReadError(t *testing.T) {
	origOS := goOS
	goOS = "linux"
	defer func() { goOS = origOS }()

	origRead := osReadFile
	osReadFile = func(name string) ([]byte, error) {
		return nil, fmt.Errorf("read error")
	}
	defer func() { osReadFile = origRead }()

	u := uptime()
	if u != "unknown" {
		t.Errorf("expected 'unknown' on read error, got %q", u)
	}
}

func TestUptime_Default(t *testing.T) {
	origOS := goOS
	goOS = "windows"
	defer func() { goOS = origOS }()

	u := uptime()
	if u != "unknown" {
		t.Errorf("expected 'unknown' for unsupported platform, got %q", u)
	}
}

func TestTotalMemory_Linux_Success(t *testing.T) {
	origOS := goOS
	goOS = "linux"
	defer func() { goOS = origOS }()

	tests := []struct {
		name     string
		meminfo  string
		expected string
	}{
		{
			name:     "standard",
			meminfo:  "MemTotal:       8192000 kB\nMemFree:        4096000 kB",
			expected: "7.8 GB",
		},
		{
			name:     "small memory",
			meminfo:  "MemTotal:          512000 kB\nMemFree:          256000 kB",
			expected: "500.0 MB",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			origRead := osReadFile
			osReadFile = func(name string) ([]byte, error) {
				return []byte(tt.meminfo), nil
			}
			defer func() { osReadFile = origRead }()

			m := totalMemory()
			if m != tt.expected {
				t.Errorf("totalMemory = %q, want %q", m, tt.expected)
			}
		})
	}
}

func TestTotalMemory_Linux_ReadError(t *testing.T) {
	origOS := goOS
	goOS = "linux"
	defer func() { goOS = origOS }()

	origRead := osReadFile
	osReadFile = func(name string) ([]byte, error) {
		return nil, fmt.Errorf("read error")
	}
	defer func() { osReadFile = origRead }()

	m := totalMemory()
	if m != "unknown" {
		t.Errorf("expected 'unknown' on read error, got %q", m)
	}
}

func TestTotalMemory_Default(t *testing.T) {
	origOS := goOS
	goOS = "windows"
	defer func() { goOS = origOS }()

	m := totalMemory()
	if m != "unknown" {
		t.Errorf("expected 'unknown' for unsupported platform, got %q", m)
	}
}

func TestInfoRun_JSONContainsFields(t *testing.T) {
	origJSON := jsonOutput
	jsonOutput = true
	defer func() { jsonOutput = origJSON }()

	output := captureOutput(func() {
		if err := infoRun(); err != nil {
			t.Fatal(err)
		}
	})
	for _, field := range []string{"hostname", "os", "arch", "cpu_count", "uptime", "memory"} {
		if !strings.Contains(output, `"`+field+`"`) {
			t.Errorf("expected JSON field %q in output, got %q", field, output)
		}
	}
}

func TestFormatBytes_EdgeCases(t *testing.T) {
	if got := formatBytes(1); got != "1 B" {
		t.Errorf("formatBytes(1) = %q, want %q", got, "1 B")
	}
	if got := formatBytes(1023); got != "1023 B" {
		t.Errorf("formatBytes(1023) = %q, want %q", got, "1023 B")
	}
	if got := formatBytes(1073741824 + 107374182); got == "" {
		t.Errorf("formatBytes should handle large values")
	}
}
