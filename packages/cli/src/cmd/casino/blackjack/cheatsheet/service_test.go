package cheatsheet

import "testing"

func TestDealerLabel(t *testing.T) {
	tests := []struct {
		i    int
		want string
	}{
		{0, " 2"},
		{7, " 9"},
		{9, " A"},
	}
	for _, tt := range tests {
		got := dealerLabel(tt.i)
		if got != tt.want {
			t.Errorf("dealerLabel(%d) = %q, want %q", tt.i, got, tt.want)
		}
	}
}

func TestCheatsheetHeader(t *testing.T) {
	h := cheatsheetHeader()
	if len(h) == 0 {
		t.Error("cheatsheetHeader() returned empty string")
	}
}

func TestCheatsheetRow(t *testing.T) {
	row := cheatsheetRow("test", hardStr[0])
	if len(row) == 0 {
		t.Error("cheatsheetRow() returned empty string")
	}
}

func TestActionString(t *testing.T) {
	tests := []struct {
		a    action
		want string
	}{
		{actH, "H"},
		{actS, "S"},
		{actD, "D"},
		{actP, "P"},
		{actN, "N"},
	}
	for _, tt := range tests {
		got := tt.a.String()
		if got != tt.want {
			t.Errorf("action(%d).String() = %q, want %q", tt.a, got, tt.want)
		}
	}
}
