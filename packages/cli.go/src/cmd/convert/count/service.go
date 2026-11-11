package count

import (
	"bufio"
	"encoding/json"
	"fmt"
	"os"
	"strings"

	"github.com/spf13/cobra"
)

type result struct {
	Characters int `json:"characters"`
	Words      int `json:"words"`
	Lines      int `json:"lines"`
}

func Run(cmd *cobra.Command, args []string) error {
	var input string
	if len(args) > 0 {
		input = args[0]
	} else {
		sc := bufio.NewScanner(os.Stdin)
		var lines []string
		for sc.Scan() {
			lines = append(lines, sc.Text())
		}
		if err := sc.Err(); err != nil {
			return err
		}
		input = strings.Join(lines, "\n")
	}

	chars := len([]rune(input))
	words := len(strings.Fields(input))
	lines := 1
	if input == "" {
		lines = 0
	} else {
		lines = strings.Count(input, "\n") + 1
	}

	useJSON, _ := cmd.Flags().GetBool("json")
	if useJSON {
		b, _ := json.MarshalIndent(result{Characters: chars, Words: words, Lines: lines}, "", "  ")
		fmt.Fprintln(cmd.OutOrStdout(), string(b))
		return nil
	}
	fmt.Fprintf(cmd.OutOrStdout(), "%8d %8d %8d\n", lines, words, chars)
	return nil
}
