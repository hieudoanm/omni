package anagram

import (
	"fmt"
	"math/rand"
	"strings"

	"github.com/AlecAivazis/survey/v2"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/games/internal"
)

func scramble(word string) string {
	runes := []rune(word)
	for i := 0; i < 10; i++ {
		rand.Shuffle(len(runes), func(i, j int) { runes[i], runes[j] = runes[j], runes[i] })
		if string(runes) != word {
			return string(runes)
		}
	}
	return string(runes)
}

func runAnagram() error {
	fmt.Println()
	fmt.Println("  ANAGRAM")
	fmt.Println("  Unscramble the letters. Type 'quit' to stop.")
	fmt.Println()

	for {
		word := internal.WORDS[rand.Intn(len(internal.WORDS))]
		scrambled := scramble(word)
		var input string
		prompt := &survey.Input{
			Message: fmt.Sprintf("  %s", scrambled),
		}
		if err := survey.AskOne(prompt, &input); err != nil {
			return nil
		}
		input = strings.ToLower(strings.TrimSpace(input))

		if input == "quit" {
			fmt.Println()
			return nil
		}

		if input == word {
			fmt.Println("  ✓ Correct!")
		} else {
			fmt.Printf("  ✗ Nope! The word was: %s\n\n", word)
		}
	}
}
