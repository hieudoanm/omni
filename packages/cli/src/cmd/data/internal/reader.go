package internal

import (
	"fmt"
	"io"
	"os"
)

func ReadInput(args []string) ([]byte, error) {
	if len(args) > 0 {
		input, err := os.ReadFile(args[0])
		if err != nil {
			return nil, fmt.Errorf("read file: %w", err)
		}
		return input, nil
	}
	input, err := io.ReadAll(os.Stdin)
	if err != nil {
		return nil, fmt.Errorf("read stdin: %w", err)
	}
	return input, nil
}
