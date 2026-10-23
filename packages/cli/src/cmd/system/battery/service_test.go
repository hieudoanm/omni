package battery

import (
	"bytes"
	"io"
	"os"
	"os/exec"
	"strings"
	"testing"
)

func TestPrintBattery_TextDischarging(t *testing.T) {
	orig := jsonOutput
	jsonOutput = false
	defer func() { jsonOutput = orig }()

	info := Info{Percent: 75, Charging: false, TimeRemain: "2:30"}
	var buf bytes.Buffer
	r, w, _ := os.Pipe()
	old := os.Stdout
	os.Stdout = w

	err := printBattery(info)

	w.Close()
	io.Copy(&buf, r)
	os.Stdout = old

	if err != nil {
		t.Fatalf("printBattery returned error: %v", err)
	}
	out := buf.String()
	if !strings.Contains(out, "75%") {
		t.Errorf("expected '75%%' in output, got %q", out)
	}
	if !strings.Contains(out, "discharging") {
		t.Errorf("expected 'discharging' in output, got %q", out)
	}
	if !strings.Contains(out, "2:30") {
		t.Errorf("expected '2:30' in output, got %q", out)
	}
}

func TestPrintBattery_TextCharging(t *testing.T) {
	orig := jsonOutput
	jsonOutput = false
	defer func() { jsonOutput = orig }()

	info := Info{Percent: 100, Charging: true, TimeRemain: "0:00"}
	var buf bytes.Buffer
	r, w, _ := os.Pipe()
	old := os.Stdout
	os.Stdout = w

	err := printBattery(info)

	w.Close()
	io.Copy(&buf, r)
	os.Stdout = old

	if err != nil {
		t.Fatalf("printBattery returned error: %v", err)
	}
	out := buf.String()
	if !strings.Contains(out, "100%") {
		t.Errorf("expected '100%%' in output, got %q", out)
	}
	if !strings.Contains(out, "charging") {
		t.Errorf("expected 'charging' in output, got %q", out)
	}
}

func TestPrintBattery_TextNoTimeRemain(t *testing.T) {
	orig := jsonOutput
	jsonOutput = false
	defer func() { jsonOutput = orig }()

	info := Info{Percent: 50, Charging: true}
	var buf bytes.Buffer
	r, w, _ := os.Pipe()
	old := os.Stdout
	os.Stdout = w

	err := printBattery(info)

	w.Close()
	io.Copy(&buf, r)
	os.Stdout = old

	if err != nil {
		t.Fatalf("printBattery returned error: %v", err)
	}
	out := buf.String()
	if strings.Contains(out, "Time remaining") {
		t.Errorf("expected no 'Time remaining' when empty, got %q", out)
	}
}

func TestParseDarwinOutput(t *testing.T) {
	tests := []struct {
		name   string
		input  string
		expect Info
	}{
		{
			name:   "charging with time",
			input:  "  -InternalBattery-0  75%  charging  2:30;  remaining",
			expect: Info{Percent: 75, Charging: true, TimeRemain: "2:30"},
		},
		{
			name:   "discharging with time",
			input:  "  -InternalBattery-0  50%  discharging  5:00;  remaining",
			expect: Info{Percent: 50, Charging: false, TimeRemain: "5:00"},
		},
		{
			name:   "charged no time",
			input:  "  -InternalBattery-0  100%  charged",
			expect: Info{Percent: 100, Charging: true},
		},
		{
			name:   "on AC power",
			input:  "  -InternalBattery-0  80%  AC",
			expect: Info{Percent: 80, Charging: true},
		},
		{
			name:   "no battery line",
			input:  "No battery in system\nNo external power",
			expect: Info{},
		},
		{
			name:   "empty input",
			input:  "",
			expect: Info{},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := parseDarwinOutput(tt.input)
			if got.Percent != tt.expect.Percent {
				t.Errorf("Percent = %d, want %d", got.Percent, tt.expect.Percent)
			}
			if got.Charging != tt.expect.Charging {
				t.Errorf("Charging = %v, want %v", got.Charging, tt.expect.Charging)
			}
			if got.TimeRemain != tt.expect.TimeRemain {
				t.Errorf("TimeRemain = %q, want %q", got.TimeRemain, tt.expect.TimeRemain)
			}
		})
	}
}

func TestDarwinBattery_ExecError(t *testing.T) {
	orig := execCommand
	execCommand = func(name string, arg ...string) *exec.Cmd {
		return exec.Command("false")
	}
	defer func() { execCommand = orig }()

	origJSON := jsonOutput
	jsonOutput = false
	defer func() { jsonOutput = origJSON }()

	err := darwinBattery()
	if err == nil {
		t.Error("expected error from failing execCommand")
	}
}

func TestDarwinBattery_ExecSuccess(t *testing.T) {
	orig := execCommand
	execCommand = func(name string, arg ...string) *exec.Cmd {
		return exec.Command("echo", "  -InternalBattery-0  75%  charging  2:30;  remaining")
	}
	defer func() { execCommand = orig }()

	origJSON := jsonOutput
	jsonOutput = false
	defer func() { jsonOutput = origJSON }()

	var buf bytes.Buffer
	r, w, _ := os.Pipe()
	old := os.Stdout
	os.Stdout = w

	err := darwinBattery()

	w.Close()
	io.Copy(&buf, r)
	os.Stdout = old

	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(buf.String(), "75%") {
		t.Errorf("expected '75%%' in output, got %q", buf.String())
	}
}

func TestLinuxBattery_Success(t *testing.T) {
	orig := execCommand
	execCommand = func(name string, arg ...string) *exec.Cmd {
		if len(arg) > 0 && strings.Contains(arg[0], "capacity") {
			return exec.Command("echo", "75")
		}
		return exec.Command("echo", "Charging")
	}
	defer func() { execCommand = orig }()

	origJSON := jsonOutput
	jsonOutput = false
	defer func() { jsonOutput = origJSON }()

	var buf bytes.Buffer
	r, w, _ := os.Pipe()
	old := os.Stdout
	os.Stdout = w

	err := linuxBattery()

	w.Close()
	io.Copy(&buf, r)
	os.Stdout = old

	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(buf.String(), "75%") {
		t.Errorf("expected '75%%' in output, got %q", buf.String())
	}
}

func TestLinuxBattery_CapacityError(t *testing.T) {
	orig := execCommand
	execCommand = func(name string, arg ...string) *exec.Cmd {
		if len(arg) > 0 && strings.Contains(arg[0], "capacity") {
			return exec.Command("false")
		}
		return exec.Command("echo", "Charging")
	}
	defer func() { execCommand = orig }()

	err := linuxBattery()
	if err == nil {
		t.Error("expected error when capacity read fails")
	}
}

func TestReadFileTrim(t *testing.T) {
	orig := execCommand
	execCommand = func(name string, arg ...string) *exec.Cmd {
		return exec.Command("echo", "test content")
	}
	defer func() { execCommand = orig }()

	result, err := readFileTrim("/some/path")
	if err != nil {
		t.Fatal(err)
	}
	if result != "test content" {
		t.Errorf("expected 'test content', got %q", result)
	}
}

func TestReadFileTrim_Error(t *testing.T) {
	orig := execCommand
	execCommand = func(name string, arg ...string) *exec.Cmd {
		return exec.Command("false")
	}
	defer func() { execCommand = orig }()

	_, err := readFileTrim("/nonexistent")
	if err == nil {
		t.Error("expected error for failing command")
	}
}

func TestPrintBattery_JSON(t *testing.T) {
	orig := jsonOutput
	jsonOutput = true
	defer func() { jsonOutput = orig }()

	info := Info{Percent: 50, Charging: true, TimeRemain: "1:00"}
	var buf bytes.Buffer
	r, w, _ := os.Pipe()
	old := os.Stdout
	os.Stdout = w

	err := printBattery(info)

	w.Close()
	io.Copy(&buf, r)
	os.Stdout = old

	if err != nil {
		t.Fatalf("printBattery returned error: %v", err)
	}
	out := buf.String()
	if !strings.Contains(out, `"percent": 50`) {
		t.Errorf("expected JSON with percent, got %q", out)
	}
	if !strings.Contains(out, `"charging": true`) {
		t.Errorf("expected JSON with charging, got %q", out)
	}
}

func TestBatteryRun_Unsupported(t *testing.T) {
	origOS := goOS
	goOS = "windows"
	defer func() { goOS = origOS }()

	err := batteryRun()
	if err == nil {
		t.Fatal("expected error for unsupported platform")
	}
	if !strings.Contains(err.Error(), "unsupported platform") {
		t.Errorf("error = %q, want unsupported platform message", err.Error())
	}
}

func TestBatteryRun_Linux(t *testing.T) {
	origOS := goOS
	goOS = "linux"
	defer func() { goOS = origOS }()

	origExec := execCommand
	execCommand = func(name string, arg ...string) *exec.Cmd {
		if len(arg) > 0 && strings.Contains(arg[0], "capacity") {
			return exec.Command("echo", "80")
		}
		return exec.Command("echo", "Discharging")
	}
	defer func() { execCommand = origExec }()

	origJSON := jsonOutput
	jsonOutput = false
	defer func() { jsonOutput = origJSON }()

	var buf bytes.Buffer
	r, w, _ := os.Pipe()
	old := os.Stdout
	os.Stdout = w

	err := batteryRun()

	w.Close()
	io.Copy(&buf, r)
	os.Stdout = old

	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(buf.String(), "80%") {
		t.Errorf("expected '80%%' in output, got %q", buf.String())
	}
}
