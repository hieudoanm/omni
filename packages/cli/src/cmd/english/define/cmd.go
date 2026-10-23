package define

import (
	"errors"
	"fmt"
	"strings"

	"github.com/hieudoanm/omni/packages/cli/src/libs/requests"
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var word string
	var defineJSON bool
	cmd := &cobra.Command{
		Use:   "define [--word <word>]",
		Short: "Look up the definition of an English word",
		Long:  `Fetches and displays the definition, part of speech, synonyms, and antonyms for a given English word from a local dictionary data source.`,
		Example: `  english define --word hello
  english define --word serendipity --json`,
		RunE: func(cmd *cobra.Command, args []string) error {
			word = strings.TrimSpace(strings.ToLower(word))
			if word == "" {
				return errors.New("word cannot be empty")
			}

			data, err := lookupWord(word, requests.Get)
			if err != nil {
				return err
			}

			fmt.Println(formatDefinition(data, defineJSON))
			return nil
		},
	}
	cmd.Flags().StringVarP(&word, "word", "w", "", "Word to define")
	cmd.Flags().BoolVar(&defineJSON, "json", false, "Output in JSON format")
	return cmd
}
