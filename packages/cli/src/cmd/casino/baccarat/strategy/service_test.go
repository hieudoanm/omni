package strategy

import "testing"

func TestRepeat(t *testing.T) {
	tests := []struct {
		s    string
		n    int
		want string
	}{
		{"-", 5, "-----"},
		{"=", 3, "==="},
		{"abc", 2, "aa"},
		{"x", 0, ""},
		{"*", 1, "*"},
		{".", 10, ".........."},
	}
	for _, tt := range tests {
		got := repeat(tt.s, tt.n)
		if got != tt.want {
			t.Errorf("repeat(%q, %d) = %q, want %q", tt.s, tt.n, got, tt.want)
		}
	}
}

func TestRepeatSingleChar(t *testing.T) {
	got := repeat("-", 38)
	if len(got) != 38 {
		t.Errorf("repeat(\"-\", 38) length = %d, want 38", len(got))
	}
	for _, b := range got {
		if b != '-' {
			t.Errorf("repeat(\"-\", 38) contains %c, want only '-'", b)
		}
	}
}
