package wordle

import (
	"encoding/json"
	"testing"
)

func TestEvaluateGuess_correct(t *testing.T) {
	r := evaluateGuess("apple", "apple")
	for i, lr := range r {
		if lr.Status != correct {
			t.Errorf("letter %d should be correct, got %v", i, lr.Status)
		}
		if lr.Letter != rune("apple"[i]) {
			t.Errorf("letter %d = %c, want %c", i, lr.Letter, "apple"[i])
		}
	}
}

func TestEvaluateGuess_allAbsent(t *testing.T) {
	r := evaluateGuess("apple", "xyzzy")
	for i, lr := range r {
		if lr.Status != absent {
			t.Errorf("letter %d should be absent, got %v", i, lr.Status)
		}
	}
}

func TestEvaluateGuess_mixed(t *testing.T) {
	r := evaluateGuess("apple", "ample")
	// a: correct, m: absent, p: correct (matches), l: correct, e: correct
	expected := []status{correct, absent, correct, correct, correct}
	if len(r) != len(expected) {
		t.Fatalf("got %d results, want %d", len(r), len(expected))
	}
	for i, e := range expected {
		if r[i].Status != e {
			t.Errorf("letter %d: got %v, want %v", i, r[i].Status, e)
		}
	}
}

func TestEvaluateGuess_differentLengths(t *testing.T) {
	r := evaluateGuess("apple", "apples")
	if len(r) != 6 {
		t.Errorf("expected 6 results, got %d", len(r))
	}
}

func TestEvaluateGuess_repeatedLetters(t *testing.T) {
	// secret: "arena", guess: "apple"
	// a: correct, p: absent, p: absent, l: absent, e: present
	r := evaluateGuess("arena", "apple")
	if r[0].Status != correct {
		t.Error("first 'a' should be correct")
	}
	if r[4].Status != present {
		t.Error("'e' should be present")
	}
}

func TestEvaluateGuess_emptySecret(t *testing.T) {
	r := evaluateGuess("", "hello")
	if len(r) != 5 {
		t.Errorf("expected 5 results, got %d", len(r))
	}
}

func TestEvaluateGuess_emptyGuess(t *testing.T) {
	r := evaluateGuess("hello", "")
	if len(r) != 0 {
		t.Errorf("expected 0 results, got %d", len(r))
	}
}

func TestIsValidWord_found(t *testing.T) {
	words := []string{"apple", "banana", "cherry"}
	if !isValidWord("apple", words) {
		t.Error("isValidWord should return true for 'apple'")
	}
}

func TestIsValidWord_notFound(t *testing.T) {
	words := []string{"apple", "banana", "cherry"}
	if isValidWord("grape", words) {
		t.Error("isValidWord should return false for 'grape'")
	}
}

func TestIsValidWord_emptyList(t *testing.T) {
	if isValidWord("apple", nil) {
		t.Error("isValidWord should return false for nil list")
	}
	if isValidWord("apple", []string{}) {
		t.Error("isValidWord should return false for empty list")
	}
}

func TestIsValidWord_caseSensitive(t *testing.T) {
	words := []string{"Apple", "Banana"}
	if isValidWord("apple", words) {
		t.Error("isValidWord should be case sensitive")
	}
}

func TestStatusToString(t *testing.T) {
	tests := []struct {
		s    status
		want string
	}{
		{correct, "correct"},
		{present, "present"},
		{absent, "absent"},
		{status(99), "absent"},
	}
	for _, tt := range tests {
		got := statusToString(tt.s)
		if got != tt.want {
			t.Errorf("statusToString(%d) = %q, want %q", tt.s, got, tt.want)
		}
	}
}

func TestBuildResult_won(t *testing.T) {
	result := buildResult("apple", true, 3, []guess{
		{Word: "ample", Result: []letterResult{
			{Letter: 'a', Status: correct},
			{Letter: 'm', Status: absent},
			{Letter: 'p', Status: present},
			{Letter: 'l', Status: absent},
			{Letter: 'e', Status: correct},
		}},
	})
	if result.Word != "apple" {
		t.Errorf("Word = %q, want 'apple'", result.Word)
	}
	if !result.Won {
		t.Error("Won should be true")
	}
	if result.Attempts != 3 {
		t.Errorf("Attempts = %d, want 3", result.Attempts)
	}
	if len(result.Guesses) != 1 {
		t.Errorf("Guesses = %d, want 1", len(result.Guesses))
	}
}

func TestBuildResult_jsonMarshal(t *testing.T) {
	result := buildResult("apple", true, 2, []guess{
		{Word: "apple", Result: []letterResult{
			{Letter: 'a', Status: correct},
			{Letter: 'p', Status: correct},
			{Letter: 'p', Status: correct},
			{Letter: 'l', Status: correct},
			{Letter: 'e', Status: correct},
		}},
	})
	data, err := json.Marshal(result)
	if err != nil {
		t.Fatal(err)
	}
	if len(data) == 0 {
		t.Fatal("expected non-empty JSON")
	}
}

func TestFormatResult(t *testing.T) {
	g := guess{
		Word: "apple",
		Result: []letterResult{
			{Letter: 'a', Status: correct},
			{Letter: 'p', Status: present},
			{Letter: 'p', Status: absent},
			{Letter: 'l', Status: present},
			{Letter: 'e', Status: correct},
		},
	}
	out := formatResult(g)
	if out == "" {
		t.Error("formatResult should not be empty")
	}
}
