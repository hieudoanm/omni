package images

import (
	"fmt"
	"os"
	"time"

	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var url string
	var out string
	var imgIndex int
	var imgJSON bool
	var waitMs int

	cmd := &cobra.Command{
		Use:   "images --url <url>",
		Short: "Download images from a fully rendered webpage",
		Long: `Open the URL in a headless browser, wait for the page to fully load,
then scrape and download all images.

Supports standard <img src>, lazy-loaded data-src, srcset,
Open Graph (og:image), and Twitter Card images.`,
		Example: `  web simplify images --url https://example.com/gallery
  web simplify images --url https://example.com/gallery --index 1
  web simplify images --url https://example.com/gallery --wait 3000
  web simplify images --url https://example.com/gallery --out ./downloads
  web simplify images --url https://example.com/gallery --json`,
		RunE: func(cmd *cobra.Command, args []string) error {
			if url == "" {
				return fmt.Errorf("url is required")
			}

			if out == "" {
				out = "."
			}

			if _, err := os.Stat(out); os.IsNotExist(err) {
				if err := os.MkdirAll(out, 0o755); err != nil {
					return fmt.Errorf("create output dir: %w", err)
				}
			}

			html, err := fetchPageHTML(url, time.Duration(waitMs)*time.Millisecond)
			if err != nil {
				return err
			}

			imageURLs := extractImageURLs(html, url)
			if len(imageURLs) == 0 {
				return fmt.Errorf("no images found on page")
			}

			if imgJSON {
				return outputImagesJSON(imageURLs, url)
			}

			if imgIndex > 0 {
				if imgIndex > len(imageURLs) {
					return fmt.Errorf("index %d out of range (found %d images)", imgIndex, len(imageURLs))
				}
				imageURLs = []string{imageURLs[imgIndex-1]}
			}

			downloaded := saveImages(imageURLs, url, imgIndex, out)
			fmt.Printf("\nDone. %d image(s) saved to %s\n", downloaded, out)
			return nil
		},
	}

	cmd.Flags().StringVarP(&url, "url", "u", "", "Page URL to scrape images from")
	cmd.MarkFlagRequired("url")
	cmd.Flags().StringVarP(&out, "out", "o", "", "Output directory (default .)")
	cmd.Flags().IntVarP(&imgIndex, "index", "i", 0, "Specific image index to download (1-based)")
	cmd.Flags().BoolVar(&imgJSON, "json", false, "Output in JSON format")
	cmd.Flags().IntVar(&waitMs, "wait", 0, "Additional milliseconds to wait after page load for lazy content")
	return cmd
}
