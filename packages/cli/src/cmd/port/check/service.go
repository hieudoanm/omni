package check

import (
	"encoding/json"
	"fmt"
	"strconv"
	"strings"
)

func outputCheckResult(host string, open bool, jsonOutput bool) {
	if jsonOutput {
		parts := strings.SplitN(host, ":", 2)
		portNum, _ := strconv.Atoi(parts[1])
		b, _ := json.MarshalIndent(map[string]interface{}{
			"host": parts[0],
			"port": portNum,
			"open": open,
		}, "", "  ")
		fmt.Println(string(b))
	} else if open {
		fmt.Printf("Port %s is open\n", host)
	} else {
		fmt.Printf("Port %s is closed\n", host)
	}
}
