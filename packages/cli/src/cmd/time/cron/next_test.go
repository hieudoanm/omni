package cron

import (
	"testing"
	"time"
)

func TestMatchCronField_Wildcard(t *testing.T) {
	if !matchCronField("*", 30, 0, 59) {
		t.Error("expected wildcard to match any value")
	}
}

func TestMatchCronField_Step(t *testing.T) {
	if !matchCronField("*/5", 10, 0, 59) {
		t.Error("expected 10 to match */5")
	}
	if matchCronField("*/5", 7, 0, 59) {
		t.Error("expected 7 not to match */5")
	}
}

func TestMatchCronField_StepZero(t *testing.T) {
	if matchCronField("*/0", 0, 0, 59) {
		t.Error("expected */0 not to match any value (division by zero)")
	}
}

func TestMatchCronField_List(t *testing.T) {
	if !matchCronField("1,3,5", 3, 0, 59) {
		t.Error("expected 3 to match list 1,3,5")
	}
	if matchCronField("1,3,5", 2, 0, 59) {
		t.Error("expected 2 not to match list 1,3,5")
	}
}

func TestMatchCronField_ListWithSpaces(t *testing.T) {
	if !matchCronField("1, 3, 5", 3, 0, 59) {
		t.Error("expected 3 to match list with spaces")
	}
}

func TestMatchCronField_Range(t *testing.T) {
	if !matchCronField("1-5", 3, 0, 59) {
		t.Error("expected 3 to match range 1-5")
	}
	if matchCronField("1-5", 0, 0, 59) {
		t.Error("expected 0 not to match range 1-5")
	}
	if matchCronField("1-5", 6, 0, 59) {
		t.Error("expected 6 not to match range 1-5")
	}
}

func TestMatchCronField_Exact(t *testing.T) {
	if !matchCronField("7", 7, 0, 59) {
		t.Error("expected 7 to match exact value 7")
	}
	if matchCronField("7", 8, 0, 59) {
		t.Error("expected 8 not to match exact value 7")
	}
}

func TestMatchCronField_Boundaries(t *testing.T) {
	if !matchCronField("0", 0, 0, 59) {
		t.Error("expected 0 to match lower bound")
	}
	if !matchCronField("59", 59, 0, 59) {
		t.Error("expected 59 to match upper bound")
	}
}

func TestCronNextRuns(t *testing.T) {
	expr := "* * * * *"
	until := time.Now().Add(5 * time.Minute).Truncate(time.Minute)
	runs := cronNextRuns(expr, 3, until)
	if len(runs) != 3 {
		t.Errorf("expected 3 runs, got %d", len(runs))
	}
}

func TestCronNextRunsInvalid(t *testing.T) {
	runs := cronNextRuns("*/15 * *", 5, time.Now().Add(time.Hour))
	if runs != nil {
		t.Error("expected nil for invalid expression")
	}
}
