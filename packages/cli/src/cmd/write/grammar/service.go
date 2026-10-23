package grammar

import (
	"fmt"
	"io"
	"os"
	"strings"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/write/internal"
)

func runE(args []string, file string) error {
	input, err := readInput(args, file)
	if err != nil {
		return err
	}

	systemPrompt := "Fix the grammar, spelling, and punctuation of the following text. Return only the corrected text without explanations."

	output, err := internal.CallLLM(systemPrompt, input)
	if err != nil {
		return err
	}

	fmt.Println(output)
	return nil
}

func readInput(args []string, file string) (string, error) {
	if file != "" {
		data, err := os.ReadFile(file)
		if err != nil {
			return "", fmt.Errorf("read file: %w", err)
		}
		return string(data), nil
	}
	if len(args) > 0 {
		return args[0], nil
	}
	data, err := io.ReadAll(os.Stdin)
	if err != nil {
		return "", fmt.Errorf("read stdin: %w", err)
	}
	return strings.TrimSpace(string(data)), nil
}
