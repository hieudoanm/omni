//go:build darwin || linux

package wifi

import (
	"strconv"
	"strings"
)

func parseWifiOutput(out string) []map[string]interface{} {
	var networks []map[string]interface{}
	for _, line := range strings.Split(strings.TrimSpace(out), "\n") {
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}
		parts := strings.SplitN(line, " | ", 3)
		if len(parts) < 3 {
			continue
		}
		ssid := parts[0]
		rssiStr := strings.TrimPrefix(parts[1], "RSSI: ")
		rssi, _ := strconv.Atoi(strings.TrimSpace(rssiStr))
		security := strings.TrimSpace(parts[2])
		networks = append(networks, map[string]interface{}{
			"ssid":     ssid,
			"rssi":     rssi,
			"security": security,
		})
	}
	return networks
}
