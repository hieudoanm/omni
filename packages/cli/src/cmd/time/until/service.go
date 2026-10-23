package until

import (
	"fmt"
	"time"
)

func printCountdown(target time.Time) error {
	now := time.Now()
	if target.Before(now) {
		fmt.Println("The specified time has already passed.")
		return nil
	}

	duration := target.Sub(now)
	days := int(duration.Hours()) / 24
	hours := int(duration.Hours()) % 24
	minutes := int(duration.Minutes()) % 60
	seconds := int(duration.Seconds()) % 60

	fmt.Printf("%dd %dh %dm %ds\n", days, hours, minutes, seconds)
	return nil
}
