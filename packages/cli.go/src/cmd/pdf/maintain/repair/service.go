package repair

import (
	"context"
	"fmt"
	"path/filepath"
	"strings"

	"github.com/pdfcpu/pdfcpu/pkg/api"
	"github.com/spf13/cobra"
)

func run(cmd *cobra.Command, file string) error {
	output, _ := cmd.Flags().GetString("output")

	if output == "" {
		ext := filepath.Ext(file)
		base := strings.TrimSuffix(file, ext)
		output = base + ".repaired.pdf"
	}

	ctx := context.Background()
	ctxDoc, err := api.ReadContextFile(ctx, file)
	if err != nil {
		return fmt.Errorf("cannot read PDF (corrupted?): %w", err)
	}

	if err := api.WriteContextFile(ctx, ctxDoc, output); err != nil {
		return fmt.Errorf("repair failed: %w", err)
	}
	fmt.Fprintf(cmd.OutOrStdout(), "Repaired %s -> %s\n", file, output)
	return nil
}
