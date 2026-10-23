package fetch

import (
	"encoding/json"
	"fmt"
	"os"
	"strings"

	"github.com/spf13/cobra"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/web/youtube/internal"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/web/youtube/transcript"
)

var (
	ytLang       string
	ytOutputFile string
	ytFormat     string
	ytNoTS       bool
)

func NewCmd() *cobra.Command {
	var url string
	cmd := &cobra.Command{
		Use:   "fetch [--url <video-id-or-url>]",
		Short: "Fetch YouTube video transcript",
		Long:  `Fetch the transcript/captions for a YouTube video by URL or video ID. Supports language selection and multiple output formats.`,
		Example: `  web youtube fetch --url dQw4w9WgXcQ
  web youtube fetch --url dQw4w9WgXcQ --lang es
  web youtube fetch --url dQw4w9WgXcQ --format json
  web youtube fetch --url dQw4w9WgXcQ --no-timestamps`,
		RunE: func(cmd *cobra.Command, args []string) error {
			videoID, err := internal.ExtractVideoID(url)
			if err != nil {
				return err
			}

			client := transcript.NewClient()
			t, err := client.Fetch(videoID, ytLang)
			if err != nil {
				return err
			}

			if ok, _ := cmd.Flags().GetBool("json"); ok {
				b, _ := json.MarshalIndent(map[string]interface{}{
					"videoId":  videoID,
					"language": t.Language,
					"kind":     t.Kind,
					"lines":    t.Lines,
				}, "", "  ")
				if ytOutputFile != "" {
					return os.WriteFile(ytOutputFile, b, 0644)
				}
				fmt.Println(string(b))
				return nil
			}

			fmt.Fprintf(os.Stderr, "✓ %s (%s, %s)\n", videoID, t.Language, t.Kind)

			var out string
			switch strings.ToLower(ytFormat) {
			case "json":
				b, _ := json.MarshalIndent(t, "", "  ")
				out = string(b)
			default:
				var sb strings.Builder
				for _, line := range t.Lines {
					if ytNoTS {
						sb.WriteString(line.Text + "\n")
					} else {
						sb.WriteString(fmt.Sprintf("[%6.2fs] %s\n", line.Start, line.Text))
					}
				}
				out = sb.String()
			}

			if ytOutputFile != "" {
				return os.WriteFile(ytOutputFile, []byte(out), 0644)
			}
			fmt.Print(out)
			return nil
		},
	}

	cmd.Flags().StringVarP(&url, "url", "u", "", "Video URL or ID")
	cmd.Flags().StringVarP(&ytLang, "lang", "l", "en", "Language code (e.g. en, es, fr)")
	cmd.Flags().StringVarP(&ytOutputFile, "output", "o", "", "Save to file instead of stdout")
	cmd.Flags().StringVarP(&ytFormat, "format", "f", "text", "Output format: text or json")
	cmd.Flags().BoolVar(&ytNoTS, "no-timestamps", false, "Omit timestamps from text output")
	return cmd
}
