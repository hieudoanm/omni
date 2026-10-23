package lorem

import (
	"fmt"
	"math/rand"
	"strings"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/convert/internal"
	"github.com/spf13/cobra"
)

var loremWords = []string{
	"lorem", "ipsum", "dolor", "sit", "amet", "consectetur",
	"adipiscing", "elit", "sed", "do", "eiusmod", "tempor",
	"incididunt", "ut", "labore", "et", "dolore", "magna",
	"aliqua", "enim", "ad", "minim", "veniam", "quis",
	"nostrud", "exercitation", "ullamco", "laboris", "nisi",
	"aliquip", "ex", "ea", "commodo", "consequat", "duis",
	"aute", "irure", "in", "reprehenderit", "voluptate",
	"velit", "esse", "cillum", "eu", "fugiat", "nulla",
	"pariatur", "excepteur", "sint", "occaecat", "cupidatat",
	"non", "proident", "sunt", "culpa", "qui", "officia",
	"deserunt", "mollit", "anim", "id", "est", "laborum",
}

type result struct {
	Text string `json:"text"`
}

func Run(cmd *cobra.Command, args []string) error {
	paragraphs, _ := cmd.Flags().GetInt("paragraphs")
	wordCount, _ := cmd.Flags().GetInt("words")
	useJSON, _ := cmd.Flags().GetBool("json")

	var text string
	if wordCount > 0 {
		text = wordString(wordCount)
	} else {
		var parts []string
		for i := 0; i < paragraphs; i++ {
			parts = append(parts, paragraph())
		}
		text = strings.Join(parts, "\n\n")
	}

	if useJSON {
		return internal.WriteJSON(cmd, result{Text: text})
	}
	fmt.Fprintln(cmd.OutOrStdout(), text)
	return nil
}

func sentence() string {
	n := rand.Intn(8) + 5
	parts := make([]string, n)
	for i := range parts {
		parts[i] = loremWords[rand.Intn(len(loremWords))]
	}
	s := strings.Join(parts, " ")
	s = strings.ToUpper(s[:1]) + s[1:] + "."
	return s
}

func paragraph() string {
	n := rand.Intn(6) + 3
	parts := make([]string, n)
	for i := range parts {
		parts[i] = sentence()
	}
	return strings.Join(parts, " ")
}

func wordString(n int) string {
	parts := make([]string, n)
	for i := range parts {
		parts[i] = loremWords[rand.Intn(len(loremWords))]
	}
	s := strings.Join(parts, " ")
	s = strings.ToUpper(s[:1]) + s[1:]
	return s
}
