package typerace

import (
	"fmt"
	"math/rand"
	"strings"
	"time"

	"github.com/AlecAivazis/survey/v2"
)

var passages = []string{
	"The quick brown fox jumps over the lazy dog near the bank of the river.",
	"A journey of a thousand miles begins with a single step toward the horizon.",
	"In the middle of difficulty lies opportunity if you know where to look.",
	"Success is not final, failure is not fatal. It is the courage to continue that counts.",
	"The only limit to our realization of tomorrow will be our doubts of today.",
	"Life is what happens when you are busy making other plans along the way.",
	"Do not watch the clock. Do what it does and keep going forward without pause.",
	"The best time to plant a tree was twenty years ago. The second best time is now.",
}

func runTyperace() error {
	passage := passages[rand.Intn(len(passages))]

	fmt.Println()
	fmt.Println("  TYPING RACE")
	fmt.Println("  Type the passage below and press Enter:")
	fmt.Printf("  \033[90m%s\033[0m\n\n", passage)

	start := time.Now()
	var input string
	prompt := &survey.Input{
		Message: "  >",
	}
	if err := survey.AskOne(prompt, &input); err != nil {
		return nil
	}
	elapsed := time.Since(start)

	input = strings.TrimRight(input, "\n")
	elapsedSec := elapsed.Seconds()

	targetWords := len(strings.Fields(passage))
	inputWords := len(strings.Fields(input))
	wpm := 0.0
	if elapsedSec > 0 {
		wpm = float64(inputWords) / elapsedSec * 60
	}

	correct := 0
	total := len(passage)
	minLen := total
	if len(input) < minLen {
		minLen = len(input)
	}
	for i := 0; i < minLen; i++ {
		if i < len(input) && i < len(passage) && input[i] == passage[i] {
			correct++
		}
	}
	accuracy := 0.0
	if total > 0 {
		accuracy = float64(correct) / float64(total) * 100
	}

	fmt.Println()
	fmt.Printf("  Time:     %.1fs\n", elapsedSec)
	fmt.Printf("  WPM:      %.0f\n", wpm)
	fmt.Printf("  Accuracy: %.0f%% (%d/%d chars)\n", accuracy, correct, total)
	fmt.Printf("  Target:   %d words\n", targetWords)
	fmt.Printf("  Typed:    %d words\n", inputWords)
	fmt.Println()

	return nil
}
