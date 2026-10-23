package leaderboards

import (
	"testing"
)

func Test_countryFromURL_lookup(t *testing.T) {
	tests := []struct {
		name     string
		url      string
		wantCode string
		wantName string
	}{
		{"US country URL", "https://api.chess.com/pub/country/US", "US", "United States"},
		{"Russia URL", "https://api.chess.com/pub/country/RU", "RU", "Russia"},
		{"VN URL", "https://api.chess.com/pub/country/VN", "VN", "Viet Nam"},
		{"lowercase code", "https://api.chess.com/pub/country/vn", "VN", "Viet Nam"},
		{"trailing slash", "https://api.chess.com/pub/country/US/", "US", "United States"},
		{"empty URL", "", "-", "-"},
		{"unknown country code", "https://api.chess.com/pub/country/XX", "XX", "-"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			gotCode, gotName := countryFromURL(tt.url)
			if gotCode != tt.wantCode {
				t.Errorf("countryFromURL(%q) code = %q, want %q", tt.url, gotCode, tt.wantCode)
			}
			if gotName != tt.wantName {
				t.Errorf("countryFromURL(%q) name = %q, want %q", tt.url, gotName, tt.wantName)
			}
		})
	}
}

func Test_countryFromURL_emptyURL(t *testing.T) {
	code, name := countryFromURL("")
	if code != "-" || name != "-" {
		t.Errorf("countryFromURL('') = (%q, %q), want (\"-\", \"-\")", code, name)
	}
}
