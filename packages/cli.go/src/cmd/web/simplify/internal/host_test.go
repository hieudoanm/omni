package internal

import "testing"

func TestExtractHost(t *testing.T) {
	tests := []struct {
		url  string
		want string
	}{
		{"https://www.example.com/page", "example_com"},
		{"https://en.wikipedia.org/wiki/Go", "en_wikipedia_org"},
		{"http://localhost:8080/test", "localhost"},
		{"invalid", "output"},
	}
	for _, tt := range tests {
		got := ExtractHost(tt.url)
		if got != tt.want {
			t.Errorf("ExtractHost(%q) = %q, want %q", tt.url, got, tt.want)
		}
	}
}
