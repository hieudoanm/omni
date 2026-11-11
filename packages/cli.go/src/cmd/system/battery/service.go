package battery

import (
	"encoding/json"
	"fmt"
	"os/exec"
	"runtime"
	"strconv"
	"strings"
)

var (
	jsonOutput  bool
	execCommand = exec.Command
	goOS        = runtime.GOOS
)

type Info struct {
	Percent    int    `json:"percent"`
	Charging   bool   `json:"charging"`
	TimeRemain string `json:"time_remaining,omitempty"`
}

func batteryRun() error {
	switch goOS {
	case "darwin":
		return darwinBattery()
	case "linux":
		return linuxBattery()
	default:
		return fmt.Errorf("unsupported platform: %s", goOS)
	}
}

func printBattery(b Info) error {
	if jsonOutput {
		out, err := json.MarshalIndent(b, "", "  ")
		if err != nil {
			return err
		}
		fmt.Println(string(out))
	} else {
		status := "discharging"
		if b.Charging {
			status = "charging"
		}
		fmt.Printf("Battery: %d%% (%s)\n", b.Percent, status)
		if b.TimeRemain != "" {
			fmt.Printf("Time remaining: %s\n", b.TimeRemain)
		}
	}
	return nil
}

func darwinBattery() error {
	out, err := execCommand("pmset", "-g", "batt").Output()
	if err != nil {
		return fmt.Errorf("pmset failed: %w", err)
	}
	info := parseDarwinOutput(string(out))
	return printBattery(info)
}

func parseDarwinOutput(out string) Info {
	info := Info{}
	lines := strings.Split(out, "\n")
	for _, line := range lines {
		if !strings.Contains(line, "InternalBattery") {
			continue
		}
		fields := strings.Fields(line)
		for _, f := range fields {
			if strings.HasSuffix(f, "%") {
				pct, err := strconv.Atoi(strings.TrimRight(f, "%"))
				if err == nil {
					info.Percent = pct
				}
			}
			if f == "charging" || f == "AC" || f == "charged" {
				info.Charging = true
			}
			if strings.HasSuffix(f, ";") && len(f) > 4 {
				f = strings.TrimRight(f, ";")
				if strings.Contains(f, ":") {
					info.TimeRemain = f
				}
			}
		}
	}
	return info
}

func linuxBattery() error {
	info := Info{}

	capacity, err := readFileTrim("/sys/class/power_supply/BAT0/capacity")
	if err != nil {
		return fmt.Errorf("read battery capacity: %w", err)
	}
	if pct, err := strconv.Atoi(capacity); err == nil {
		info.Percent = pct
	}

	status, err := readFileTrim("/sys/class/power_supply/BAT0/status")
	if err == nil {
		info.Charging = status == "Charging"
	}

	return printBattery(info)
}

func readFileTrim(path string) (string, error) {
	data, err := execCommand("cat", path).Output()
	if err != nil {
		return "", err
	}
	return strings.TrimSpace(string(data)), nil
}
