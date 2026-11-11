package age

import (
	"encoding/json"
	"fmt"
	"time"
)

func daysInMonth(y, m int) int {
	return time.Date(y, time.Month(m+2), 0, 0, 0, 0, 0, time.UTC).Day()
}

func calcAge(birthYear, birthMonth, birthDay int) (years, months, days int) {
	now := time.Now()
	ty, tm, td := now.Date()

	if td < birthDay {
		tm--
		td += daysInMonth(ty, int(tm))
	}
	if int(tm) < birthMonth {
		ty--
		tm += 12
	}

	years = ty - birthYear
	months = int(tm) - birthMonth
	days = td - birthDay
	return
}

func runAge(year, month, day int, jsonOutput bool) error {
	if year == 0 || month == 0 || day == 0 {
		return fmt.Errorf("birth year, month, and day are required")
	}
	if month < 1 || month > 12 {
		return fmt.Errorf("month must be between 1 and 12")
	}
	if day < 1 || day > 31 {
		return fmt.Errorf("day must be between 1 and 31")
	}

	birth := time.Date(year, time.Month(month), day, 0, 0, 0, 0, time.UTC)
	if birth.Year() != year || birth.Month() != time.Month(month) || birth.Day() != day {
		return fmt.Errorf("invalid birth date: %04d/%02d/%02d does not exist", year, month, day)
	}
	if birth.After(time.Now()) {
		return fmt.Errorf("birth date cannot be in the future")
	}

	y, m, d := calcAge(year, month, day)

	if jsonOutput {
		out, err := json.MarshalIndent(map[string]interface{}{
			"birth_date": birth.Format("2006-01-02"),
			"years":      y,
			"months":     m,
			"days":       d,
		}, "", "  ")
		if err != nil {
			return err
		}
		fmt.Println(string(out))
	} else {
		fmt.Printf("Age: %d years, %d months, %d days\n", y, m, d)
	}
	return nil
}
