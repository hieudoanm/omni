package find

import (
	"encoding/json"
	"fmt"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/port/portutil"
)

func findAvailablePort(start, end int) (int, error) {
	for port := start; port <= end; port++ {
		addr := fmt.Sprintf("localhost:%d", port)
		if !portutil.CheckPortOpen(addr, 1) {
			return port, nil
		}
	}
	return 0, fmt.Errorf("no available ports in range %d-%d", start, end)
}

func outputFindResult(port int, jsonOutput bool) {
	if jsonOutput {
		b, _ := json.MarshalIndent(map[string]interface{}{
			"port": port,
		}, "", "  ")
		fmt.Println(string(b))
	} else {
		fmt.Printf("Available port: %d\n", port)
	}
}
