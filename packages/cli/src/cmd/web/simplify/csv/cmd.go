package csv

import (
	"encoding/json"
	"fmt"
	"os"

	"github.com/spf13/cobra"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/web/simplify/internal"
)

func NewCmd() *cobra.Command {
	var url string
	var out string

	cmd := &cobra.Command{
		Use:   "csv --url <url>",
		Short: "Extract HTML tables to CSV",
		Long: `Fetch a webpage, detect all <table> elements, and save each table as a CSV file.

If the page contains a single table it is saved as <domain>.csv.
Multiple tables produce individual <domain>-table-<N>.csv files.`,
		Example: `  web simplify csv --url https://en.wikipedia.org/wiki/List_of_countries_by_population
  web simplify csv --url https://example.com/data --out ./output`,
		RunE: func(cmd *cobra.Command, args []string) error {
			if url == "" {
				return fmt.Errorf("url is required")
			}

			if out == "" {
				out = "."
			}

			if _, err := os.Stat(out); os.IsNotExist(err) {
				return fmt.Errorf("directory %s does not exist", out)
			}

			html, err := internal.FetchPage(url)
			if err != nil {
				return err
			}

			tables, err := parseTables(html)
			if err != nil {
				return err
			}

			if len(tables) == 0 {
				if ok, _ := cmd.Flags().GetBool("json"); ok {
					b, _ := json.MarshalIndent(map[string]interface{}{
						"url":   url,
						"files": []string{},
					}, "", "  ")
					fmt.Println(string(b))
				} else {
					fmt.Println("no tables found")
				}
				return nil
			}

			paths, err := tablesToCSVFiles(tables, url, out)
			if err != nil {
				return err
			}

			if ok, _ := cmd.Flags().GetBool("json"); ok {
				b, _ := json.MarshalIndent(map[string]interface{}{
					"url":   url,
					"files": paths,
				}, "", "  ")
				fmt.Println(string(b))
			} else {
				for _, p := range paths {
					fmt.Println(p)
				}
			}

			return nil
		},
	}

	cmd.Flags().StringVarP(&url, "url", "u", "", "URL to fetch")
	cmd.MarkFlagRequired("url")
	cmd.Flags().StringVarP(&out, "out", "o", "", "Output directory (default .)")
	return cmd
}
