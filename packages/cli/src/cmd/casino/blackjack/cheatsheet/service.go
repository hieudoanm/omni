package cheatsheet

import (
	"fmt"
	"strings"
)

type action int

const (
	actH action = iota
	actS
	actD
	actP
	actN
)

func (a action) String() string {
	switch a {
	case actH:
		return "H"
	case actS:
		return "S"
	case actD:
		return "D"
	case actP:
		return "P"
	case actN:
		return "N"
	default:
		return "?"
	}
}

var hardStr = [17][10]action{
	{actH, actH, actH, actH, actH, actH, actH, actH, actH, actH},
	{actH, actH, actH, actH, actH, actH, actH, actH, actH, actH},
	{actH, actH, actH, actH, actH, actH, actH, actH, actH, actH},
	{actH, actH, actH, actH, actH, actH, actH, actH, actH, actH},
	{actH, actH, actH, actH, actH, actH, actH, actH, actH, actH},
	{actH, actH, actH, actH, actH, actH, actH, actH, actH, actH},
	{actH, actH, actH, actH, actH, actH, actH, actH, actH, actH},
	{actH, actD, actD, actD, actD, actH, actH, actH, actH, actH},
	{actD, actD, actD, actD, actD, actD, actD, actD, actH, actH},
	{actH, actH, actS, actS, actS, actH, actH, actH, actH, actH},
	{actS, actS, actS, actS, actS, actH, actH, actH, actH, actH},
	{actS, actS, actS, actS, actS, actH, actH, actH, actH, actH},
	{actS, actS, actS, actS, actS, actH, actH, actH, actH, actH},
	{actS, actS, actS, actS, actS, actS, actS, actS, actS, actS},
	{actS, actS, actS, actS, actS, actS, actS, actS, actS, actS},
	{actS, actS, actS, actS, actS, actS, actS, actS, actS, actS},
	{actS, actS, actS, actS, actS, actS, actS, actS, actS, actS},
}

var softStr = [8][10]action{
	{actH, actH, actD, actD, actD, actH, actH, actH, actH, actH},
	{actH, actD, actD, actD, actD, actH, actH, actH, actH, actH},
	{actH, actD, actD, actD, actD, actH, actH, actH, actH, actH},
	{actH, actD, actD, actD, actD, actH, actH, actH, actH, actH},
	{actH, actD, actD, actD, actD, actH, actH, actH, actH, actH},
	{actS, actS, actS, actS, actD, actS, actS, actS, actH, actH},
	{actS, actS, actS, actS, actS, actS, actS, actS, actS, actS},
	{actS, actS, actS, actS, actS, actS, actS, actS, actS, actS},
}

var pairStr = [10][10]action{
	{actP, actP, actP, actP, actP, actP, actH, actH, actH, actH},
	{actP, actP, actP, actP, actP, actP, actH, actH, actH, actH},
	{actH, actH, actH, actP, actP, actH, actH, actH, actH, actH},
	{actH, actH, actH, actH, actH, actH, actH, actH, actH, actH},
	{actP, actP, actP, actP, actP, actH, actH, actH, actH, actH},
	{actP, actP, actP, actP, actP, actP, actH, actH, actH, actH},
	{actP, actP, actP, actP, actP, actS, actP, actP, actS, actS},
	{actP, actP, actP, actP, actP, actS, actP, actP, actS, actS},
	{actS, actS, actS, actS, actS, actS, actS, actS, actS, actS},
	{actP, actP, actP, actP, actP, actP, actP, actP, actP, actP},
}

func dealerLabel(i int) string {
	if i == 9 {
		return " A"
	}
	return fmt.Sprintf("%2d", i+2)
}

func cheatsheetHeader() string {
	header := "    "
	for i := 0; i < 10; i++ {
		header += dealerLabel(i) + " "
	}
	return header
}

func cheatsheetRow(label string, acts [10]action) string {
	row := fmt.Sprintf("%-4s", label)
	for _, a := range acts {
		row += " " + a.String() + " "
	}
	return row
}

func runCheatsheet() error {
	header := cheatsheetHeader()

	fmt.Println(strings.Repeat("=", 47))
	fmt.Println("  BASIC BLACKJACK STRATEGY")
	fmt.Println(strings.Repeat("=", 47))
	fmt.Println()
	fmt.Println("  H = Hit   S = Stand   D = Double   P = Split")
	fmt.Println()

	fmt.Println("  Dealer upcard:")
	fmt.Println("  " + header)
	fmt.Println("  " + strings.Repeat("─", 33))

	fmt.Println("  HARD TOTALS")
	for total := 5; total <= 21; total++ {
		idx := total - 5
		if idx < len(hardStr) {
			label := fmt.Sprintf("%2d", total)
			fmt.Println("  " + cheatsheetRow(label, hardStr[idx]))
		}
	}

	fmt.Println()
	fmt.Println("  SOFT TOTALS")
	for i := 0; i < len(softStr); i++ {
		label := fmt.Sprintf("A,%d", i+2)
		fmt.Println("  " + cheatsheetRow(label, softStr[i]))
	}

	fmt.Println()
	fmt.Println("  PAIR SPLITTING")
	pairLabels := []string{"2,2", "3,3", "4,4", "5,5", "6,6", "7,7", "8,8", "9,9", "10,10", "A,A"}
	for i, a := range pairStr {
		fmt.Println("  " + cheatsheetRow(pairLabels[i], a))
	}

	fmt.Println()
	fmt.Println(strings.Repeat("─", 47))
	fmt.Println("  D = Double if allowed, otherwise Hit")
	fmt.Println("  Based on 6+ decks, dealer hits soft 17 (H17)")
	fmt.Println("  Blackjack pays 3:2")
	fmt.Println(strings.Repeat("─", 47))

	return nil
}
