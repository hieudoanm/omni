package cron

import (
	"encoding/json"
	"fmt"
	"time"
)

func runCron(expression string, next int, until string, cronJSON bool) error {
	untilTime, err := parseUntil(until)
	if err != nil {
		return err
	}

	var runs []*time.Time
	if next > 0 {
		runs = cronNextRuns(expression, next, untilTime)
	}

	if cronJSON {
		return outputCronJSON(expression, runs)
	}
	outputCronText(expression, runs)
	return nil
}

func parseUntil(until string) (time.Time, error) {
	if until == "" {
		return time.Date(2100, 1, 1, 0, 0, 0, 0, time.Local), nil
	}
	t, err := time.Parse("2006-01-02", until)
	if err != nil {
		return time.Time{}, fmt.Errorf("invalid --until date: %s", err)
	}
	return t, nil
}

func outputCronJSON(expr string, runs []*time.Time) error {
	runStrs := make([]string, len(runs))
	for i, t := range runs {
		runStrs[i] = t.Format("2006-01-02 15:04 Mon")
	}
	out, err := json.MarshalIndent(map[string]interface{}{
		"expression":  expr,
		"description": cronDescribe(expr),
		"next_runs":   runStrs,
	}, "", "  ")
	if err != nil {
		return err
	}
	fmt.Println(string(out))
	return nil
}

func outputCronText(expr string, runs []*time.Time) {
	fmt.Printf("Expression: %s\n", expr)
	fmt.Printf("Description: %s\n", cronDescribe(expr))
	fmt.Println()
	if len(runs) > 0 {
		fmt.Printf("Next %d runs:\n", len(runs))
		for i, t := range runs {
			fmt.Printf("  %2d. %s\n", i+1, t.Format("2006-01-02 15:04 Mon"))
		}
	}
}
