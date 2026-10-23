package age

import (
	"fmt"
	"time"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/time/internal"
)

func runAge(dateStr string, jsonOutput bool) error {
	birthdate, err := internal.ParseDatetime(dateStr)
	if err != nil {
		return fmt.Errorf("invalid date: %w", err)
	}

	now := time.Now()
	if birthdate.After(now) {
		return fmt.Errorf("birthdate cannot be in the future")
	}

	years := now.Year() - birthdate.Year()
	months := int(now.Month()) - int(birthdate.Month())
	days := now.Day() - birthdate.Day()

	if days < 0 {
		months--
		prevMonth := now.AddDate(0, -1, 0)
		days += time.Date(prevMonth.Year(), prevMonth.Month()+1, 0, 0, 0, 0, 0, time.UTC).Day()
	}
	if months < 0 {
		years--
		months += 12
	}

	if jsonOutput {
		fmt.Printf(`{"birthdate":"%s","years":%d,"months":%d,"days":%d}`, dateStr, years, months, days)
		fmt.Println()
		return nil
	}
	fmt.Printf("You are %d years, %d months, and %d days old\n", years, months, days)
	return nil
}
