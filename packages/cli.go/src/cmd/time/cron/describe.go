package cron

import (
	"fmt"
	"strconv"
	"strings"
)

var cronMonthNames = map[string]int{
	"jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6,
	"jul": 7, "aug": 8, "sep": 9, "oct": 10, "nov": 11, "dec": 12,
}

var cronWeekNames = map[string]int{
	"sun": 0, "mon": 1, "tue": 2, "wed": 3, "thu": 4, "fri": 5, "sat": 6,
}

func cronDescribe(expr string) string {
	fields := strings.Fields(expr)
	if len(fields) != 5 {
		return "invalid cron expression (need 5 fields)"
	}

	minute := cronExpandField(fields[0], 0, 59, nil)
	hour := cronExpandField(fields[1], 0, 23, nil)
	dom := cronExpandField(fields[2], 1, 31, nil)
	month := cronExpandField(fields[3], 1, 12, cronMonthNames)
	dow := cronExpandField(fields[4], 0, 6, cronWeekNames)

	var parts []string

	if minute == "every" && hour == "every" {
		parts = append(parts, "every minute")
	} else if hour == "every" {
		parts = append(parts, fmt.Sprintf("minute %s of every hour", minute))
	} else if minute == "every" {
		parts = append(parts, fmt.Sprintf("every minute of hour %s", hour))
	} else {
		parts = append(parts, fmt.Sprintf("at %s:%s", cronZeropad(hour), cronZeropad(minute)))
	}

	if month != "*" && month != "every" {
		parts = append(parts, fmt.Sprintf("in %s", month))
	}
	if dom != "*" && dom != "every" {
		parts = append(parts, fmt.Sprintf("on day %s", dom))
	}
	if dow != "*" && dow != "every" {
		parts = append(parts, fmt.Sprintf("on %s", dow))
	}

	return strings.Join(parts, " ")
}

func cronExpandField(field string, min, max int, names map[string]int) string {
	if field == "*" {
		return "every"
	}
	if strings.HasPrefix(field, "*/") {
		n, err := strconv.Atoi(field[2:])
		if err != nil {
			return field
		}
		return fmt.Sprintf("every %d", n)
	}
	if strings.Contains(field, "-") {
		parts := strings.SplitN(field, "-", 2)
		from := cronResolveName(parts[0], names)
		to := cronResolveName(parts[1], names)
		return fmt.Sprintf("%s-%s", from, to)
	}
	if strings.Contains(field, ",") {
		return field
	}
	return cronResolveName(field, names)
}

func cronResolveName(val string, names map[string]int) string {
	if name, ok := names[strings.ToLower(val)]; ok {
		return fmt.Sprintf("%d", name)
	}
	return val
}

func cronZeropad(s string) string {
	n, err := strconv.Atoi(s)
	if err != nil {
		return s
	}
	if n < 10 {
		return fmt.Sprintf("0%d", n)
	}
	return s
}
