package md

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"

	"github.com/spf13/cobra"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/web/simplify/internal"
)

func NewCmd() *cobra.Command {
	var url string
	var out string

	cmd := &cobra.Command{
		Use:   "md --url <url>",
		Short: "Convert webpage to markdown",
		Long: `Fetch a webpage, extract its readable content (reader view), and save it as a markdown file.

If reader view is not available the raw page is converted instead.`,
		Example: `  web simplify md --url https://en.wikipedia.org/wiki/Go_(programming_language)
  web simplify md --url https://example.com/article --out ./output`,
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

			source := html
			title, readableHTML, ok, err := extractReadable(html, url)
			if err != nil {
				return err
			}
			if ok {
				source = readableHTML
			}

			markdown, err := convertToMarkdown(source)
			if err != nil {
				return err
			}

			if title != "" {
				markdown = "# " + title + "\n\n" + markdown
			}

			filename := internal.ExtractHost(url) + ".md"
			filePath := filepath.Join(out, filename)

			if err := os.WriteFile(filePath, []byte(markdown), 0644); err != nil {
				return fmt.Errorf("write %s: %w", filePath, err)
			}

			absPath, _ := filepath.Abs(filePath)

			if ok, _ := cmd.Flags().GetBool("json"); ok {
				b, _ := json.MarshalIndent(map[string]interface{}{
					"url":  url,
					"file": absPath,
				}, "", "  ")
				fmt.Println(string(b))
			} else {
				fmt.Println(absPath)
			}

			return nil
		},
	}

	cmd.Flags().StringVarP(&url, "url", "u", "", "URL to fetch")
	cmd.MarkFlagRequired("url")
	cmd.Flags().StringVarP(&out, "out", "o", "", "Output directory (default .)")
	return cmd
}
