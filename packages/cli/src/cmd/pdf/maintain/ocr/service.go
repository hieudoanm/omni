package ocr

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"

	"github.com/spf13/cobra"
)

func run(cmd *cobra.Command, file string) error {
	language, _ := cmd.Flags().GetString("language")
	output, _ := cmd.Flags().GetString("output")

	if _, err := exec.LookPath("tesseract"); err != nil {
		return fmt.Errorf("tesseract not found: install it first (brew install tesseract / apt install tesseract-ocr)")
	}

	dir := filepath.Dir(file)
	tmpPrefix := filepath.Join(dir, "_ocr_tmp_")

	args := []string{file, tmpPrefix, "-l", language, "--psm", "3"}
	c := exec.Command("tesseract", args...)
	c.Stderr = os.Stderr
	if err := c.Run(); err != nil {
		return fmt.Errorf("tesseract failed: %w", err)
	}

	txtFile := tmpPrefix + ".txt"
	data, err := os.ReadFile(txtFile)
	if err != nil {
		return fmt.Errorf("cannot read OCR output: %w", err)
	}
	os.Remove(txtFile)

	if output != "" {
		if err := os.WriteFile(output, data, 0644); err != nil {
			return fmt.Errorf("cannot write output: %w", err)
		}
		fmt.Fprintf(cmd.OutOrStdout(), "OCR output written to %s\n", output)
	} else {
		fmt.Fprint(cmd.OutOrStdout(), string(data))
	}

	return nil
}
