package delete

import (
	"fmt"
	"strings"

	"github.com/pdfcpu/pdfcpu/pkg/api"
	"github.com/spf13/cobra"
)

func run(cmd *cobra.Command, file string) error {
	pages, _ := cmd.Flags().GetString("pages")
	output, _ := cmd.Flags().GetString("output")

	if pages == "" {
		return fmt.Errorf("--pages is required")
	}

	conf := api.LoadConfiguration()
	selected := strings.Split(pages, ",")

	if err := api.RemovePagesFile(file, output, selected, conf); err != nil {
		return fmt.Errorf("delete pages failed: %w", err)
	}
	fmt.Fprintf(cmd.OutOrStdout(), "Deleted pages [%s] from %s\n", pages, file)
	return nil
}
