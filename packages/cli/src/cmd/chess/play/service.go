package play

import (
	"bufio"
	"fmt"
	"os"
	"strings"

	"github.com/notnil/chess"
	"github.com/spf13/cobra"
)

func runPlay(cmd *cobra.Command, args []string) error {
	game := chess.NewGame()
	reader := bufio.NewReader(os.Stdin)

	blind, _ := cmd.Flags().GetBool("blind")

	fmt.Println("♟ Chess CLI - Interactive Play")
	fmt.Println("Type moves in SAN (e.g., e4, Nf3). Type 'exit' to quit.")
	if blind {
		fmt.Println("Blind mode is ON. Board will not be displayed. Type 'show' to view the board temporarily.")
	}
	fmt.Println()

	for game.Outcome() == chess.NoOutcome {
		if !blind {
			fmt.Println(game.Position().Board().Draw())
		}

		fmt.Printf("%s to move: ", game.Position().Turn())

		input, _ := reader.ReadString('\n')
		input = strings.TrimSpace(input)

		if input == "exit" {
			fmt.Println("Exiting game.")
			break
		}

		if blind && input == "show" {
			fmt.Println(game.Position().Board().Draw())
			continue
		}

		err := game.MoveStr(input)
		if err != nil {
			fmt.Println("❌ Invalid or illegal move:", err)
			continue
		}
	}

	fmt.Printf("\n♟ Game PGN:\n%s\n", game.String())

	fmt.Println("\n♟ Game UCI:")
	for _, move := range game.Moves() {
		fmt.Printf("%s ", move.String())
	}
	fmt.Println()

	if game.Outcome() != chess.NoOutcome {
		fmt.Println("Game over:", game.Outcome())
		fmt.Println("Method:", game.Method())
	}

	return nil
}
