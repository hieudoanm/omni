package split

import (
	"context"
	"fmt"
	"path/filepath"
	"strings"

	"github.com/pdfcpu/pdfcpu/pkg/api"
	"github.com/spf13/cobra"
)

func run(cmd *cobra.Command, file string) error {
	pageArg, _ := cmd.Flags().GetString("pages")
	output, _ := cmd.Flags().GetString("output")

	if output == "" {
		ext := filepath.Ext(file)
		base := strings.TrimSuffix(file, ext)
		output = base + "_split"
	}

	ctx := context.Background()
	conf, err := api.LoadConfiguration(api.ConfigurationOptions{})
	if err != nil {
		return fmt.Errorf("cannot load config: %w", err)
	}
	if pageArg != "" {
		selected := strings.Split(pageArg, ",")
		if err := api.ExtractPagesFile(ctx, file, output, selected, conf); err != nil {
			return fmt.Errorf("extract failed: %w", err)
		}
		fmt.Fprintf(cmd.OutOrStdout(), "Extracted pages [%s] to %s\n", pageArg, output)
	} else {
		if err := api.SplitFile(ctx, file, output, 1, conf); err != nil {
			return fmt.Errorf("split failed: %w", err)
		}
		fmt.Fprintf(cmd.OutOrStdout(), "Split %s into pages in %s\n", file, output)
	}
	return nil
}
