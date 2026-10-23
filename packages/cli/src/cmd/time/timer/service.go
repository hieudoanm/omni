package timer

import (
	"fmt"
	"os"
	"os/signal"
	"strconv"
	"strings"
	"time"
)

func runTimer(durationStr string, jsonOutput bool) error {
	d, err := parseTimerDuration(durationStr)
	if err != nil {
		return err
	}

	sig := make(chan os.Signal, 1)
	signal.Notify(sig, os.Interrupt)

	timer := time.NewTimer(d)
	start := time.Now()

	select {
	case <-sig:
		timer.Stop()
		elapsed := time.Since(start)
		if jsonOutput {
			fmt.Printf(`{"status":"cancelled","elapsed":"%s"}`, formatTimerDuration(elapsed))
			fmt.Println()
		} else {
			fmt.Printf("\nTimer cancelled after %s\n", formatTimerDuration(elapsed))
		}
		return nil
	case <-timer.C:
		elapsed := time.Since(start)
		if jsonOutput {
			fmt.Printf(`{"status":"completed","duration":"%s","elapsed":"%s"}`, durationStr, formatTimerDuration(elapsed))
			fmt.Println()
		} else {
			fmt.Printf("Time's up! (elapsed: %s)\n", formatTimerDuration(elapsed))
		}
		return nil
	}
}

func parseTimerDuration(s string) (time.Duration, error) {
	if s == "" {
		return 0, fmt.Errorf("duration is required")
	}
	if strings.HasSuffix(s, "s") {
		n, err := strconv.Atoi(strings.TrimSuffix(s, "s"))
		if err != nil {
			return 0, fmt.Errorf("invalid duration: %s", s)
		}
		return time.Duration(n) * time.Second, nil
	}
	if strings.HasSuffix(s, "m") {
		n, err := strconv.Atoi(strings.TrimSuffix(s, "m"))
		if err != nil {
			return 0, fmt.Errorf("invalid duration: %s", s)
		}
		return time.Duration(n) * time.Minute, nil
	}
	if strings.HasSuffix(s, "h") {
		n, err := strconv.Atoi(strings.TrimSuffix(s, "h"))
		if err != nil {
			return 0, fmt.Errorf("invalid duration: %s", s)
		}
		return time.Duration(n) * time.Hour, nil
	}
	n, err := strconv.Atoi(s)
	if err != nil {
		return 0, fmt.Errorf("invalid duration: %s", s)
	}
	return time.Duration(n) * time.Second, nil
}

func formatTimerDuration(d time.Duration) string {
	totalSeconds := int(d.Seconds())
	minutes := totalSeconds / 60
	seconds := totalSeconds % 60
	return fmt.Sprintf("%02d:%02d", minutes, seconds)
}
