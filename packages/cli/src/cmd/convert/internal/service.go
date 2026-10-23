package internal

import (
	"encoding/json"
	"regexp"
	"strings"
	"unicode"

	"github.com/AlecAivazis/survey/v2"
	"github.com/spf13/cobra"
	"golang.org/x/text/unicode/norm"
)

func WriteJSON(cmd *cobra.Command, v interface{}) error {
	enc := json.NewEncoder(cmd.OutOrStdout())
	enc.SetIndent("", "  ")
	return enc.Encode(v)
}

func ResolveText(args []string) (string, error) {
	if len(args) > 0 {
		return args[0], nil
	}
	var text string
	prompt := &survey.Input{Message: "Text:"}
	if err := survey.AskOne(prompt, &text); err != nil {
		return "", err
	}
	return text, nil
}

var braille = map[rune]string{
	'a': "⠁", 'b': "⠃", 'c': "⠉", 'd': "⠙", 'e': "⠑", 'f': "⠋", 'g': "⠛", 'h': "⠓",
	'i': "⠊", 'j': "⠚", 'k': "⠅", 'l': "⠇", 'm': "⠍", 'n': "⠝", 'o': "⠕", 'p': "⠏",
	'q': "⠟", 'r': "⠗", 's': "⠎", 't': "⠞", 'u': "⠥", 'v': "⠧", 'w': "⠺", 'x': "⠭",
	'y': "⠽", 'z': "⠵",
	'.': "⠲", ',': "⠂", ';': "⠆", ':': "⠒", '!': "⠖", '?': "⠦", '\'': "⠄", '-': "⠤",
	'(': "⠣", ')': "⠜", '"': "⠘",
}

func ToBraille(text string) string {
	var result strings.Builder
	for _, ch := range strings.ToLower(text) {
		code, exists := braille[ch]
		if exists {
			result.WriteString(code)
		} else {
			result.WriteRune(ch)
		}
	}
	return result.String()
}

var morseMap = map[rune]string{
	'a': ".-", 'b': "-...", 'c': "-.-.", 'd': "-..", 'e': ".",
	'f': "..-.", 'g': "--.", 'h': "....", 'i': "..", 'j': ".---",
	'k': "-.-", 'l': ".-..", 'm': "--", 'n': "-.", 'o': "---",
	'p': ".--.", 'q': "--.-", 'r': ".-.", 's': "...", 't': "-",
	'u': "..-", 'v': "...-", 'w': ".--", 'x': "-..-", 'y': "-.--", 'z': "--..",
	'1': ".----", '2': "..---", '3': "...--", '4': "....-", '5': ".....",
	'6': "-....", '7': "--...", '8': "---..", '9': "----.", '0': "-----",
	'.': ".-.-.-", ',': "--..--", ';': "-.-.-.", ':': "---...",
	'!': "-.-.--", '?': "..--..", '\'': ".----.", '-': "-....-",
	'(': "-.--.", ')': "-.--.-", '"': ".-..-.", '/': "-..-.",
}

func ToMorse(text string) string {
	var result []string
	for _, ch := range strings.ToLower(text) {
		code, found := morseMap[ch]
		if found {
			result = append(result, code)
		} else {
			result = append(result, string(ch))
		}
	}
	return strings.Join(result, " ")
}

func ToCamelCase(s string) string {
	words := strings.FieldsFunc(s, func(r rune) bool {
		return r == ' ' || r == '-' || r == '_'
	})
	for i, w := range words {
		if i == 0 {
			words[i] = strings.ToLower(w)
		} else {
			words[i] = string(unicode.ToUpper(rune(w[0]))) + strings.ToLower(w[1:])
		}
	}
	return strings.Join(words, "")
}

func ToPascalCase(s string) string {
	words := strings.FieldsFunc(s, func(r rune) bool {
		return r == ' ' || r == '-' || r == '_'
	})
	for i, w := range words {
		words[i] = string(unicode.ToUpper(rune(w[0]))) + strings.ToLower(w[1:])
	}
	return strings.Join(words, "")
}

func ToKebabCase(s string) string {
	re := regexp.MustCompile("([a-z0-9])([A-Z])")
	kebab := re.ReplaceAllString(s, "${1}-${2}")
	kebab = strings.ReplaceAll(kebab, " ", "-")
	kebab = strings.ReplaceAll(kebab, "_", "-")
	return strings.ToLower(kebab)
}

func ToSnakeCase(s string) string {
	re := regexp.MustCompile("([a-z0-9])([A-Z])")
	snake := re.ReplaceAllString(s, "${1}_${2}")
	snake = strings.ReplaceAll(snake, " ", "_")
	snake = strings.ReplaceAll(snake, "-", "_")
	return strings.ToLower(snake)
}

func Capitalise(s string) string {
	words := strings.Fields(s)
	for i, word := range words {
		if len(word) > 0 {
			words[i] = string(unicode.ToUpper(rune(word[0]))) + strings.ToLower(word[1:])
		}
	}
	return strings.Join(words, " ")
}

func Deburr(s string) string {
	t := norm.NFD.String(s)
	var sb strings.Builder
	for _, r := range t {
		if unicode.IsMark(r) {
			continue
		}
		sb.WriteRune(r)
	}
	return sb.String()
}

var nonSlug = regexp.MustCompile(`[^a-z0-9-]`)
var multiDash = regexp.MustCompile(`-+`)

func Slug(s string) string {
	slug := strings.ToLower(s)
	slug = strings.ReplaceAll(slug, " ", "-")
	slug = nonSlug.ReplaceAllString(slug, "")
	slug = multiDash.ReplaceAllString(slug, "-")
	slug = strings.Trim(slug, "-")
	return slug
}
