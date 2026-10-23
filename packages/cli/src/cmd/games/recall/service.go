package recall

import (
	"fmt"
	"math/rand"
	"strings"
	"time"

	"github.com/AlecAivazis/survey/v2"
)

func runRecall() error {
	fmt.Println()
	fmt.Println("  NUMBER RECALL")
	fmt.Println("  A number will flash on screen. Type it back from memory.")
	fmt.Println("  The length increases each round. Type 'quit' to stop.")
	fmt.Println("  Press Enter to start...")
	fmt.Scanln()

	length := 3
	streak := 0

	for {
		var sb strings.Builder
		sb.WriteString(fmt.Sprintf("%d", 1+rand.Intn(9)))
		for i := 1; i < length; i++ {
			sb.WriteString(fmt.Sprintf("%d", rand.Intn(10)))
		}
		number := sb.String()

		fmt.Printf("\r  %s", number)
		time.Sleep(time.Duration(500+length*250) * time.Millisecond)
		fmt.Print("\r" + strings.Repeat(" ", length+2) + "\r")

		var input string
		prompt := &survey.Input{
			Message: "  >",
		}
		if err := survey.AskOne(prompt, &input); err != nil {
			return nil
		}
		input = strings.TrimSpace(input)

		if input == "quit" {
			fmt.Println()
			fmt.Printf("  Longest streak: %d\n", streak)
			fmt.Printf("  Longest number: %d digits\n", length)
			fmt.Println()
			return nil
		}

		if input == number {
			streak++
			fmt.Printf("  \033[32m✓ Correct! Streak: %d\033[0m\n\n", streak)
			if length < maxDigits {
				length++
			}
		} else {
			fmt.Printf("  \033[31m✗ Nope! It was: %s\033[0m\n\n", number)
			fmt.Println("  Starting over...")
			length = 3
			streak = 0
		}
	}
}
