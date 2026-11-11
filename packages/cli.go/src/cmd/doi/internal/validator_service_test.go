package internal

import "testing"

func TestIsValidDOI(t *testing.T) {
	tests := []struct {
		id    string
		valid bool
	}{
		{"10.1000/xyz123", true},
		{"10.1038/nature12373", true},
		{"10.1234/abc-def_789", true},
		{"not-a-doi", false},
		{"", false},
		{"11.1000/xyz123", false},
		{"10.abc/xyz", false},
	}
	for _, tt := range tests {
		got := IsValidDOI(tt.id)
		if got != tt.valid {
			t.Errorf("IsValidDOI(%q) = %v, want %v", tt.id, got, tt.valid)
		}
	}
}
