package internal

import (
	"testing"
	"time"
)

func TestParseDatetime_rfc3339(t *testing.T) {
	got, err := ParseDatetime("2024-01-15T10:30:00Z")
	if err != nil {
		t.Fatal(err)
	}
	want := time.Date(2024, 1, 15, 10, 30, 0, 0, time.UTC)
	if !got.Equal(want) {
		t.Errorf("got %v, want %v", got, want)
	}
}

func TestParseDatetime_compact(t *testing.T) {
	got, err := ParseDatetime("2024-01-15T10:30:00")
	if err != nil {
		t.Fatal(err)
	}
	if got.Year() != 2024 || got.Month() != 1 || got.Day() != 15 {
		t.Errorf("got %v, want 2024-01-15", got)
	}
}

func TestParseDatetime_spaceSeparated(t *testing.T) {
	got, err := ParseDatetime("2024-06-01 14:30:00")
	if err != nil {
		t.Fatal(err)
	}
	if got.Year() != 2024 || got.Month() != 6 || got.Day() != 1 {
		t.Errorf("got %v, want 2024-06-01", got)
	}
	if got.Hour() != 14 || got.Minute() != 30 {
		t.Errorf("got time %v, want 14:30", got)
	}
}

func TestParseDatetime_dateOnly(t *testing.T) {
	got, err := ParseDatetime("2024-12-25")
	if err != nil {
		t.Fatal(err)
	}
	if got.Year() != 2024 || got.Month() != 12 || got.Day() != 25 {
		t.Errorf("got %v, want 2024-12-25", got)
	}
}

func TestParseDatetime_invalid(t *testing.T) {
	_, err := ParseDatetime("not-a-date")
	if err == nil {
		t.Fatal("expected error for invalid date")
	}
}

func TestParseDatetime_empty(t *testing.T) {
	_, err := ParseDatetime("")
	if err == nil {
		t.Fatal("expected error for empty string")
	}
}

func TestParseDatetime_partial(t *testing.T) {
	_, err := ParseDatetime("2024")
	if err == nil {
		t.Fatal("expected error for partial date")
	}
}

func TestParseDatetime_leapYear(t *testing.T) {
	got, err := ParseDatetime("2024-02-29")
	if err != nil {
		t.Fatal(err)
	}
	if got.Day() != 29 || got.Month() != 2 {
		t.Errorf("got %v, want 2024-02-29", got)
	}
}

func TestParseDatetime_timezone(t *testing.T) {
	got, err := ParseDatetime("2024-01-15T10:30:00+05:30")
	if err != nil {
		t.Fatal(err)
	}
	_, offset := got.Zone()
	if offset != 5*3600+1800 {
		t.Errorf("expected +05:30 offset, got %d", offset)
	}
}

func TestParseDatetime_midnight(t *testing.T) {
	got, err := ParseDatetime("2024-01-01T00:00:00")
	if err != nil {
		t.Fatal(err)
	}
	if got.Hour() != 0 || got.Minute() != 0 || got.Second() != 0 {
		t.Errorf("got %v, want midnight", got)
	}
}
