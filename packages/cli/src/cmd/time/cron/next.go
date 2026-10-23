package cron

import (
	"strconv"
	"strings"
	"time"
)

func matchCronField(field string, value, min, max int) bool {
	if field == "*" {
		return true
	}
	if strings.HasPrefix(field, "*/") {
		stepStr := strings.TrimPrefix(field, "*/")
		step, err := strconv.Atoi(stepStr)
		if err != nil || step == 0 {
			return false
		}
		return value%step == 0
	}
	if strings.Contains(field, ",") {
		for _, part := range strings.Split(field, ",") {
			part = strings.TrimSpace(part)
			if matchCronField(part, value, min, max) {
				return true
			}
		}
		return false
	}
	if strings.Contains(field, "-") {
		parts := strings.SplitN(field, "-", 2)
		start, err1 := strconv.Atoi(parts[0])
		end, err2 := strconv.Atoi(parts[1])
		if err1 == nil && err2 == nil {
			return value >= start && value <= end
		}
		return false
	}
	v, err := strconv.Atoi(field)
	if err != nil {
		return false
	}
	return v == value
}

func cronNextRuns(expression string, count int, until time.Time) []*time.Time {
	parts := strings.Fields(expression)
	if len(parts) != 5 {
		return nil
	}

	fields := make([]string, 5)
	for i, part := range parts {
		resolved := cronResolveName(part, cronMonthNames)
		if i == 4 {
			resolved = cronResolveName(resolved, cronWeekNames)
		}
		fields[i] = resolved
	}

	var runs []*time.Time
	now := time.Now().Add(time.Minute)
	candidate := time.Date(now.Year(), now.Month(), now.Day(), now.Hour(), now.Minute(), 0, 0, time.Local)

	for len(runs) < count && !candidate.After(until) {
		candidate = candidate.Add(time.Minute)
		if !matchCronField(fields[0], candidate.Minute(), 0, 59) {
			continue
		}
		if !matchCronField(fields[1], candidate.Hour(), 0, 23) {
			continue
		}
		if !matchCronField(fields[2], candidate.Day(), 1, 31) {
			continue
		}
		if !matchCronField(fields[3], int(candidate.Month()), 1, 12) {
			continue
		}
		if !matchCronField(fields[4], int(candidate.Weekday()), 0, 6) {
			continue
		}
		t := candidate
		runs = append(runs, &t)
	}
	return runs
}
