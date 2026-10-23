package shared

import (
	"os"
	"testing"
)

func TestGithubToken(t *testing.T) {
	orig := os.Getenv("GITHUB_TOKEN")
	defer os.Setenv("GITHUB_TOKEN", orig)

	os.Setenv("GITHUB_TOKEN", "test-token-123")
	if got := GithubToken(); got != "test-token-123" {
		t.Errorf("GithubToken() = %q, want 'test-token-123'", got)
	}

	os.Unsetenv("GITHUB_TOKEN")
	if got := GithubToken(); got != "" {
		t.Errorf("GithubToken() = %q, want ''", got)
	}
}

func TestLanguageColors(t *testing.T) {
	tests := []struct {
		lang string
		hex  string
	}{
		{"Go", "#00ADD8"},
		{"TypeScript", "#3178C6"},
		{"Rust", "#DEA584"},
		{"Python", "#3572A5"},
		{"JavaScript", "#F7DF1E"},
		{"Java", "#B07219"},
		{"C", "#555555"},
		{"C++", "#F34B7D"},
		{"Ruby", "#701516"},
	}

	for _, tt := range tests {
		got, ok := LanguageColors[tt.lang]
		if !ok {
			t.Errorf("LanguageColors missing entry for %q", tt.lang)
			continue
		}
		if got != tt.hex {
			t.Errorf("LanguageColors[%q] = %q, want %q", tt.lang, got, tt.hex)
		}
	}
}
