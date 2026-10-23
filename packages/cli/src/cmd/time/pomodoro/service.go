package pomodoro

import (
	"fmt"
	"os"
	"os/signal"
	"time"
)

func runPomodoro(work, rest int) error {
	fmt.Printf("Launching Pomodoro (%d min work, %d min rest)\n", work, rest)

	sig := make(chan os.Signal, 1)
	signal.Notify(sig, os.Interrupt)

	workDur := time.Duration(work) * time.Minute
	restDur := time.Duration(rest) * time.Minute

	for {
		fmt.Print("\rWork interval (Ctrl+C to quit)...")
		select {
		case <-sig:
			fmt.Println("\nPomodoro session ended.")
			return nil
		case <-time.After(workDur):
		}

		fmt.Print("\rRest interval...       ")
		select {
		case <-sig:
			fmt.Println("\nPomodoro session ended.")
			return nil
		case <-time.After(restDur):
		}
	}
}
