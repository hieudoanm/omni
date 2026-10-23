package snapshot

import (
	"github.com/hieudoanm/omni/packages/cli/src/libs/browser"
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var (
		flagURL      string
		flagOutput   string
		flagWidth    int
		flagHeight   int
		flagPreset   string
		flagFullPage bool
		flagDelay    string
		flagPDF      bool
		flagQuality  int
		flagVerbose  bool
		flagJSON     bool
	)

	cmd := &cobra.Command{
		Use:   "snapshot [--url <url>]",
		Short: "Take a screenshot of a web page",
		Long: `Take a full or viewport screenshot of a given URL.
The output file is saved as PNG (default) or PDF.
If --output is a directory, the filename is derived from the URL hostname + timestamp.`,
		Example: `  web snapshot --url https://example.com
  web snapshot --url https://example.com --full-page
  web snapshot --url https://example.com --pdf
  web snapshot --url https://example.com --preset mobile
  web snapshot --url https://example.com --delay 2s`,
		RunE: func(cmd *cobra.Command, args []string) error {
			opts := browser.DefaultOptions()
			if p, ok := browser.Presets[flagPreset]; ok {
				opts.Width = p.Width
				opts.Height = p.Height
			}
			if flagWidth > 0 {
				opts.Width = flagWidth
			}
			if flagHeight > 0 {
				opts.Height = flagHeight
			}
			opts.FullPage = flagFullPage
			opts.PDF = flagPDF
			opts.Quality = flagQuality
			if flagDelay != "" {
				d, err := parseDuration(flagDelay)
				if err != nil {
					return err
				}
				opts.Delay = d
			}

			result, err := snapshotRun(flagURL, flagOutput, opts, flagVerbose)
			if err != nil {
				return err
			}

			if flagJSON {
				return outputJSON(result)
			}
			outputText(result, flagVerbose)
			return nil
		},
	}

	cmd.Flags().StringVarP(&flagURL, "url", "u", "", "URL to capture")
	cmd.Flags().StringVarP(&flagOutput, "output", "o", "", "Output file or directory")
	cmd.Flags().IntVar(&flagWidth, "width", 0, "Viewport width (overrides --preset)")
	cmd.Flags().IntVar(&flagHeight, "height", 0, "Viewport height (overrides --preset)")
	cmd.Flags().StringVar(&flagPreset, "preset", "desktop", "Viewport preset: desktop|laptop|tablet|mobile|hd|4k")
	cmd.Flags().BoolVar(&flagFullPage, "full-page", false, "Capture full scrollable page")
	cmd.Flags().StringVar(&flagDelay, "delay", "", "Wait before capturing (e.g. 500ms, 2s)")
	cmd.Flags().BoolVar(&flagPDF, "pdf", false, "Save as PDF instead of PNG")
	cmd.Flags().IntVar(&flagQuality, "quality", 90, "Screenshot quality 1-100 (JPEG only)")
	cmd.Flags().BoolVarP(&flagVerbose, "verbose", "v", false, "Print extra info")
	cmd.Flags().BoolVar(&flagJSON, "json", false, "Output in JSON format")
	return cmd
}
