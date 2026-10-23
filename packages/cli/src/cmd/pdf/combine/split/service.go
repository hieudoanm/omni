package split

import (
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

	conf := api.LoadConfiguration()
	if pageArg != "" {
		selected := strings.Split(pageArg, ",")
		if err := api.ExtractPagesFile(file, output, selected, conf); err != nil {
			return fmt.Errorf("extract failed: %w", err)
		}
		fmt.Fprintf(cmd.OutOrStdout(), "Extracted pages [%s] to %s\n", pageArg, output)
	} else {
		if err := api.SplitFile(file, output, 1, conf); err != nil {
			return fmt.Errorf("split failed: %w", err)
		}
		fmt.Fprintf(cmd.OutOrStdout(), "Split %s into pages in %s\n", file, output)
	}
	return nil
}
