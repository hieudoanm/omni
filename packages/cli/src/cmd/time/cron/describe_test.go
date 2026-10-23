package cron

import (
	"strings"
	"testing"
)

func TestCronDescribeEvery15(t *testing.T) {
	desc := cronDescribe("*/15 * * * *")
	if !strings.Contains(desc, "every 15") {
		t.Errorf("expected 'every 15' in description, got: %s", desc)
	}
}

func TestCronDescribeWeekdaysAt9(t *testing.T) {
	desc := cronDescribe("0 9 * * 1-5")
	if !strings.Contains(desc, "at 09:00") {
		t.Errorf("expected 'at 09:00' in description, got: %s", desc)
	}
}

func TestCronDescribeEveryMinute(t *testing.T) {
	desc := cronDescribe("* * * * *")
	if !strings.Contains(desc, "every minute") {
		t.Errorf("expected 'every minute' in description, got: %s", desc)
	}
}

func TestCronDescribeInvalid(t *testing.T) {
	desc := cronDescribe("*/15 * *")
	if !strings.Contains(desc, "invalid cron expression") {
		t.Errorf("expected 'invalid cron expression', got: %s", desc)
	}
}

func TestCronDescribeEveryMinuteOfHour(t *testing.T) {
	desc := cronDescribe("* 9 * * *")
	if !strings.Contains(desc, "every minute of hour") {
		t.Errorf("expected 'every minute of hour' in description, got: %s", desc)
	}
}

func TestCronDescribeWithDayOfWeek(t *testing.T) {
	desc := cronDescribe("0 9 * * 1")
	if !strings.Contains(desc, "on 1") {
		t.Errorf("expected 'on 1' in description, got: %s", desc)
	}
}

func TestCronDescribeWithMonthAndDay(t *testing.T) {
	desc := cronDescribe("0 9 15 6 *")
	if !strings.Contains(desc, "at 09:00") && !strings.Contains(desc, "on day 15") && !strings.Contains(desc, "in 6") {
		t.Errorf("expected month and day in description, got: %s", desc)
	}
}

func TestCronDescribeStepMinutes(t *testing.T) {
	desc := cronDescribe("*/5 * * * *")
	if !strings.Contains(desc, "every 5") {
		t.Errorf("expected 'every 5' in description, got: %s", desc)
	}
}

func TestCronDescribeStepHour(t *testing.T) {
	desc := cronDescribe("0 */2 * * *")
	if !strings.Contains(desc, "every 2") {
		t.Errorf("expected 'every 2' in description, got: %s", desc)
	}
}

func TestCronDescribeNamedMonth(t *testing.T) {
	desc := cronDescribe("0 9 * jan *")
	if !strings.Contains(desc, "in 1") {
		t.Errorf("expected 'in 1' in description, got: %s", desc)
	}
}

func TestCronDescribeNamedWeekday(t *testing.T) {
	desc := cronDescribe("0 9 * * mon")
	if !strings.Contains(desc, "on 1") {
		t.Errorf("expected 'on 1' in description, got: %s", desc)
	}
}

func TestCronDescribeList(t *testing.T) {
	desc := cronDescribe("0,30 9 * * *")
	if !strings.Contains(desc, "0,30") {
		t.Errorf("expected list handling in description, got: %s", desc)
	}
}

func TestCronDescribeSpecificTime(t *testing.T) {
	desc := cronDescribe("30 14 * * *")
	if !strings.Contains(desc, "at 14:30") {
		t.Errorf("expected 'at 14:30' in description, got: %s", desc)
	}
}

func TestCronDescribeWithMonth(t *testing.T) {
	desc := cronDescribe("0 9 * jan *")
	if !strings.Contains(desc, "in 1") {
		t.Errorf("expected 'in 1' in description, got: %s", desc)
	}
}
