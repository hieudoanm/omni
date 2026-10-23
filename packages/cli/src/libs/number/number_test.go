package number

import "testing"

func TestAddZero(t *testing.T) {
	tests := []struct {
		input    int
		expected string
	}{
		{0, "00"},
		{1, "01"},
		{8, "08"},
		{9, "9"},
		{10, "10"},
		{99, "99"},
	}

	for _, tt := range tests {
		result := AddZero(tt.input)
		if result != tt.expected {
			t.Errorf("AddZero(%d) = %s; expected %s", tt.input, result, tt.expected)
		}
	}
}

func TestComma(t *testing.T) {
	tests := []struct {
		input    int
		expected string
	}{
		{0, "0"},
		{1, "1"},
		{12, "12"},
		{123, "123"},
		{999, "999"},
		{1000, "1,000"},
		{1234, "1,234"},
		{12345, "12,345"},
		{123456, "123,456"},
		{1234567, "1,234,567"},
		{12345678, "12,345,678"},
		{123456789, "123,456,789"},
		{1234567890, "1,234,567,890"},
		{1000000, "1,000,000"},
		{1000000000, "1,000,000,000"},
		{-1, "-1"},
		{-12, "-12"},
		{-123, "-123"},
		{-999, "-999"},
		{-1000, "-1,000"},
		{-1234, "-1,234"},
		{-1234567, "-1,234,567"},
		{-1234567890, "-1,234,567,890"},
	}

	for _, tt := range tests {
		result := Comma(tt.input)
		if result != tt.expected {
			t.Errorf("Comma(%d) = %s; expected %s", tt.input, result, tt.expected)
		}
	}
}
