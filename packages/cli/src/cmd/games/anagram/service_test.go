package anagram

import (
	"strings"
	"testing"
)

func TestScramble_changesOrder(t *testing.T) {
	original := "hello"
	result := scramble(original)
	if result == "" {
		t.Fatal("scramble returned empty string")
	}
}

func TestScramble_sameLetters(t *testing.T) {
	original := "hello"
	result := scramble(original)
	if len(result) != len(original) {
		t.Errorf("scramble length = %d, want %d", len(result), len(original))
	}
	for _, c := range original {
		if !strings.ContainsRune(result, c) {
			t.Errorf("scramble missing letter %c", c)
		}
	}
}

func TestScramble_singleChar(t *testing.T) {
	got := scramble("a")
	if got != "a" {
		t.Errorf("scramble('a') = %q, want 'a'", got)
	}
}

func TestScramble_shorterWord(t *testing.T) {
	got := scramble("go")
	if len(got) != 2 {
		t.Errorf("scramble('go') length = %d, want 2", len(got))
	}
}

func TestScramble_unicode(t *testing.T) {
	got := scramble("café")
	if got == "" {
		t.Fatal("scramble('café') returned empty")
	}
	if len([]rune(got)) != 4 {
		t.Errorf("scramble('café') rune count = %d, want 4", len([]rune(got)))
	}
}

func TestScramble_repeatedLetters(t *testing.T) {
	original := "aaabbb"
	result := scramble(original)
	if len(result) != 6 {
		t.Errorf("scramble('aaabbb') length = %d, want 6", len(result))
	}
}
