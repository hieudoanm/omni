package stopwatch

import (
	"context"
	"fmt"
	"time"
)

func runStopwatch(ctx context.Context, jsonOutput bool) error {
	start := time.Now()
	fmt.Println("Stopwatch started (Ctrl+C to stop)...")

	<-ctx.Done()

	elapsed := time.Since(start)
	if jsonOutput {
		fmt.Printf(`{"elapsed":"%s"}`, formatDuration(elapsed))
		fmt.Println()
	} else {
		fmt.Printf("Elapsed: %s\n", formatDuration(elapsed))
	}
	return nil
}

func formatDuration(d time.Duration) string {
	totalSeconds := int(d.Seconds())
	hours := totalSeconds / 3600
	minutes := (totalSeconds % 3600) / 60
	seconds := totalSeconds % 60
	return fmt.Sprintf("%02d:%02d:%02d", hours, minutes, seconds)
}
