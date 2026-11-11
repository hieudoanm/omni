package info

import (
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"runtime"
	"strconv"
	"strings"
	"time"
)

var (
	jsonOutput  bool
	osHostname  = os.Hostname
	osReadFile  = os.ReadFile
	execCommand = exec.Command
	goOS        = runtime.GOOS
)

type SysInfo struct {
	Hostname string `json:"hostname"`
	OS       string `json:"os"`
	Arch     string `json:"arch"`
	CPUCount int    `json:"cpu_count"`
	Uptime   string `json:"uptime"`
	Memory   string `json:"memory"`
}

func infoRun() error {
	info := SysInfo{
		Hostname: hostname(),
		OS:       runtime.GOOS,
		Arch:     runtime.GOARCH,
		CPUCount: runtime.NumCPU(),
		Uptime:   uptime(),
		Memory:   totalMemory(),
	}

	if jsonOutput {
		b, _ := json.MarshalIndent(info, "", "  ")
		fmt.Println(string(b))
	} else {
		fmt.Printf("Hostname: %s\n", info.Hostname)
		fmt.Printf("OS:       %s\n", info.OS)
		fmt.Printf("Arch:     %s\n", info.Arch)
		fmt.Printf("CPU:      %d cores\n", info.CPUCount)
		fmt.Printf("Uptime:   %s\n", info.Uptime)
		fmt.Printf("Memory:   %s\n", info.Memory)
	}
	return nil
}

func hostname() string {
	h, err := osHostname()
	if err != nil {
		return "unknown"
	}
	return h
}

func uptime() string {
	switch goOS {
	case "darwin":
		out, err := execCommand("sysctl", "-n", "kern.boottime").Output()
		if err != nil {
			return "unknown"
		}
		fields := strings.Fields(string(out))
		for _, f := range fields {
			if strings.HasPrefix(f, "sec") {
				continue
			}
			f = strings.TrimRight(f, ",")
			if sec, err := strconv.ParseInt(f, 10, 64); err == nil {
				boot := time.Unix(sec, 0)
				d := time.Since(boot).Round(time.Second)
				return d.String()
			}
		}
		return "unknown"
	case "linux":
		data, err := osReadFile("/proc/uptime")
		if err != nil {
			return "unknown"
		}
		parts := strings.Fields(string(data))
		if len(parts) > 0 {
			sec, err := strconv.ParseFloat(parts[0], 64)
			if err == nil {
				return (time.Duration(sec) * time.Second).Round(time.Second).String()
			}
		}
		return "unknown"
	default:
		return "unknown"
	}
}

func totalMemory() string {
	switch goOS {
	case "darwin":
		out, err := execCommand("sysctl", "-n", "hw.memsize").Output()
		if err != nil {
			return "unknown"
		}
		bytes, err := strconv.ParseInt(strings.TrimSpace(string(out)), 10, 64)
		if err != nil {
			return "unknown"
		}
		return formatBytes(bytes)
	case "linux":
		data, err := osReadFile("/proc/meminfo")
		if err != nil {
			return "unknown"
		}
		for _, line := range strings.Split(string(data), "\n") {
			if strings.HasPrefix(line, "MemTotal:") {
				parts := strings.Fields(line)
				if len(parts) >= 2 {
					kb, err := strconv.ParseInt(parts[1], 10, 64)
					if err != nil {
						return "unknown"
					}
					return formatBytes(kb * 1024)
				}
			}
		}
		return "unknown"
	default:
		return "unknown"
	}
}

func formatBytes(b int64) string {
	const unit = 1024
	if b < unit {
		return fmt.Sprintf("%d B", b)
	}
	div, exp := int64(unit), 0
	for n := b / unit; n >= unit; n /= unit {
		div *= unit
		exp++
	}
	sizes := []string{"KB", "MB", "GB", "TB"}
	return fmt.Sprintf("%.1f %s", float64(b)/float64(div), sizes[exp])
}
