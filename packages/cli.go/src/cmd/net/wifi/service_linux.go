//go:build linux

package wifi

import (
	"fmt"
	"os/exec"
	"strings"
)

func ScanWifi() (string, error) {
	out, err := exec.Command(
		"nmcli", "--terse", "--fields", "SSID,SIGNAL,SECURITY",
		"device", "wifi", "list",
	).Output()
	if err != nil {
		return "", fmt.Errorf("nmcli: %w", err)
	}

	lines := strings.Split(strings.TrimSpace(string(out)), "\n")
	var sb strings.Builder

	for _, line := range lines {
		parts := strings.SplitN(line, ":", 3)
		if len(parts) != 3 {
			continue
		}
		ssid, signal, security := parts[0], parts[1], parts[2]
		if ssid == "" {
			ssid = "<hidden>"
		}
		fmt.Fprintf(&sb, "%s | RSSI: %s | %s\n", ssid, signal, security)
	}

	return sb.String(), nil
}
