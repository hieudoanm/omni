package ebook

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
)

func runE(input, format, output string) error {
	path, err := exec.LookPath("ebook-convert")
	if err != nil {
		return fmt.Errorf("ebook-convert not found in PATH (install calibre): %w", err)
	}

	if output == "" {
		ext := filepath.Ext(input)
		base := strings.TrimSuffix(filepath.Base(input), ext)
		output = base + "." + format
	}

	cmd := exec.Command(path, input, output)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	if err := cmd.Run(); err != nil {
		return fmt.Errorf("ebook-convert failed: %w", err)
	}

	fmt.Printf("Created: %s\n", output)
	return nil
}
