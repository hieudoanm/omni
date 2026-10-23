package now

import (
	"fmt"
	"time"
)

func RunNow(format string, jsonOutput bool) error {
	now := time.Now()
	if jsonOutput {
		fmt.Printf(`{"utc":"%s","local":"%s","unix":%d}`, now.UTC().Format(time.RFC3339), now.Format(time.RFC3339), now.Unix())
		fmt.Println()
		return nil
	}
	if format != "" {
		fmt.Println(now.Format(format))
		return nil
	}
	fmt.Printf("Local: %s\n", now.Format(time.RFC1123))
	fmt.Printf("UTC:   %s\n", now.UTC().Format(time.RFC1123))
	fmt.Printf("Unix:  %d\n", now.Unix())
	return nil
}
