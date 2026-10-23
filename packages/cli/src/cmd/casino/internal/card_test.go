package internal

import "testing"

func TestParseCard(t *testing.T) {
	tests := []struct {
		input string
		want  Card
	}{
		{"2c", Card{Rank: 2, Suit: Clubs}},
		{"3d", Card{Rank: 3, Suit: Diamonds}},
		{"4h", Card{Rank: 4, Suit: Hearts}},
		{"5s", Card{Rank: 5, Suit: Spades}},
		{"9c", Card{Rank: 9, Suit: Clubs}},
		{"Td", Card{Rank: 10, Suit: Diamonds}},
		{"Jh", Card{Rank: 11, Suit: Hearts}},
		{"Qs", Card{Rank: 12, Suit: Spades}},
		{"Kc", Card{Rank: 13, Suit: Clubs}},
		{"Ad", Card{Rank: 14, Suit: Diamonds}},
	}
	for _, tt := range tests {
		got := ParseCard(tt.input)
		if got != tt.want {
			t.Errorf("ParseCard(%q) = %+v, want %+v", tt.input, got, tt.want)
		}
	}
}

func TestCardString(t *testing.T) {
	tests := []struct {
		card Card
		want string
	}{
		{Card{Rank: 2, Suit: Clubs}, "2c"},
		{Card{Rank: 10, Suit: Diamonds}, "Td"},
		{Card{Rank: 11, Suit: Hearts}, "Jh"},
		{Card{Rank: 12, Suit: Spades}, "Qs"},
		{Card{Rank: 13, Suit: Clubs}, "Kc"},
		{Card{Rank: 14, Suit: Diamonds}, "Ad"},
	}
	for _, tt := range tests {
		got := tt.card.String()
		if got != tt.want {
			t.Errorf("Card{%+v}.String() = %q, want %q", tt.card, got, tt.want)
		}
	}
}

func TestCardParseStringRoundtrip(t *testing.T) {
	inputs := []string{"2c", "3d", "4h", "5s", "9c", "Td", "Jh", "Qs", "Kc", "Ad"}
	for _, s := range inputs {
		card := ParseCard(s)
		got := card.String()
		if got != s {
			t.Errorf("roundtrip %q: ParseCard().String() = %q", s, got)
		}
	}
}
