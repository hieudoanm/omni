package wordle

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"strings"

	"github.com/AlecAivazis/survey/v2"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/games/internal"
)

const (
	green  = "\033[32m"
	yellow = "\033[33m"
	gray   = "\033[90m"
	reset  = "\033[0m"
	bold   = "\033[1m"
)

type status int

const (
	absent status = iota
	present
	correct
)

type letterResult struct {
	Letter rune
	Status status
}

type guess struct {
	Word   string
	Result []letterResult
}

type gameResult struct {
	Word     string      `json:"word"`
	Won      bool        `json:"won"`
	Attempts int         `json:"attempts"`
	Guesses  []guessJSON `json:"guesses"`
}

type guessJSON struct {
	Word   string   `json:"word"`
	Result []string `json:"result"`
}

func runWordle(jsonOutput bool) error {
	res := playGame(internal.WORDS)
	if jsonOutput {
		b, _ := json.MarshalIndent(res, "", "  ")
		fmt.Println(string(b))
	}
	return nil
}

func evaluateGuess(secret, guessWord string) []letterResult {
	secretRunes := []rune(secret)
	guessRunes := []rune(guessWord)
	result := make([]letterResult, len(guessRunes))
	used := make([]bool, len(secretRunes))

	for i, g := range guessRunes {
		if i < len(secretRunes) && g == secretRunes[i] {
			result[i] = letterResult{Letter: g, Status: correct}
			used[i] = true
		} else {
			result[i] = letterResult{Letter: g, Status: absent}
		}
	}

	for i, r := range result {
		if r.Status == correct {
			continue
		}
		for j, s := range secretRunes {
			if !used[j] && r.Letter == s {
				result[i] = letterResult{Letter: r.Letter, Status: present}
				used[j] = true
				break
			}
		}
	}

	return result
}

func formatResult(g guess) string {
	var sb strings.Builder
	for _, r := range g.Result {
		switch r.Status {
		case correct:
			sb.WriteString(green + bold)
		case present:
			sb.WriteString(yellow + bold)
		case absent:
			sb.WriteString(gray)
		}
		sb.WriteRune(r.Letter)
		sb.WriteString(reset + " ")
	}
	return sb.String()
}

func isValidWord(word string, words []string) bool {
	for _, w := range words {
		if w == word {
			return true
		}
	}
	return false
}

func statusToString(s status) string {
	switch s {
	case correct:
		return "correct"
	case present:
		return "present"
	case absent:
		return "absent"
	default:
		return "absent"
	}
}

func playGame(words []string) *gameResult {
	secret := words[rand.Intn(len(words))]
	var guesses []guess

	fmt.Println()
	fmt.Println(bold + "  WORDLE" + reset)
	fmt.Println(gray + "  Guess the 5-letter word. You have 6 tries." + reset)
	fmt.Println()

	for turn := 1; turn <= 6; turn++ {
		var input string
		prompt := &survey.Input{
			Message: fmt.Sprintf("Guess %d/6:", turn),
		}
		if err := survey.AskOne(prompt, &input); err != nil {
			return nil
		}
		input = strings.ToLower(strings.TrimSpace(input))

		if len(input) != 5 {
			fmt.Println(gray + "  Word must be exactly 5 letters." + reset)
			turn--
			continue
		}

		if !isValidWord(input, words) {
			fmt.Println(gray + "  Not in word list." + reset)
			turn--
			continue
		}

		result := evaluateGuess(secret, input)
		g := guess{Word: input, Result: result}
		guesses = append(guesses, g)

		fmt.Println()
		for _, prev := range guesses {
			fmt.Println("  " + formatResult(prev))
		}
		fmt.Println()

		if input == secret {
			fmt.Println(green + bold + fmt.Sprintf("  You got it in %d tries! 🎉", turn) + reset)
			fmt.Println()
			return buildResult(secret, true, turn, guesses)
		}
	}

	fmt.Println(gray + fmt.Sprintf("  The word was: %s%s%s", reset, bold, secret) + reset)
	fmt.Println()
	return buildResult(secret, false, 6, guesses)
}

func buildResult(secret string, won bool, attempts int, guesses []guess) *gameResult {
	res := &gameResult{
		Word:     secret,
		Won:      won,
		Attempts: attempts,
		Guesses:  make([]guessJSON, len(guesses)),
	}
	for i, g := range guesses {
		statuses := make([]string, len(g.Result))
		for j, r := range g.Result {
			statuses[j] = statusToString(r.Status)
		}
		res.Guesses[i] = guessJSON{Word: g.Word, Result: statuses}
	}
	return res
}
