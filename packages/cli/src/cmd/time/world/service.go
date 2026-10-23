package world

import (
	"fmt"
	"time"
)

var commonZones = map[string]string{
	"utc":       "UTC",
	"ny":        "America/New_York",
	"london":    "Europe/London",
	"tokyo":     "Asia/Tokyo",
	"hcmc":      "Asia/Ho_Chi_Minh",
	"hanoi":     "Asia/Ho_Chi_Minh",
	"sf":        "America/Los_Angeles",
	"la":        "America/Los_Angeles",
	"paris":     "Europe/Paris",
	"berlin":    "Europe/Berlin",
	"mumbai":    "Asia/Kolkata",
	"beijing":   "Asia/Shanghai",
	"seoul":     "Asia/Seoul",
	"sydney":    "Australia/Sydney",
	"dubai":     "Asia/Dubai",
	"singapore": "Asia/Singapore",
	"hk":        "Asia/Hong_Kong",
	"ams":       "Europe/Amsterdam",
	"chi":       "America/Chicago",
	"den":       "America/Denver",
	"phx":       "America/Phoenix",
}

func runWorld(args []string) error {
	now := time.Now()

	if len(args) > 0 {
		for _, alias := range args {
			loc, err := loadLocation(alias)
			if err != nil {
				return fmt.Errorf("unknown timezone: %s", alias)
			}
			fmt.Printf("%s: %s\n", alias, now.In(loc).Format(time.RFC1123))
		}
		return nil
	}

	zones := []struct {
		alias string
		zone  string
	}{
		{"utc", "UTC"},
		{"ny", "America/New_York"},
		{"london", "Europe/London"},
		{"tokyo", "Asia/Tokyo"},
		{"hcmc", "Asia/Ho_Chi_Minh"},
	}
	for _, z := range zones {
		loc, err := time.LoadLocation(z.zone)
		if err != nil {
			return fmt.Errorf("unknown timezone: %s", z.zone)
		}
		fmt.Printf("%s: %s\n", z.alias, now.In(loc).Format(time.RFC1123))
	}
	return nil
}

func loadLocation(alias string) (*time.Location, error) {
	if zone, ok := commonZones[alias]; ok {
		return time.LoadLocation(zone)
	}
	return time.LoadLocation(alias)
}
