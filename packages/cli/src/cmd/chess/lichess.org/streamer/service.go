package streamer

import (
	"encoding/json"
	"fmt"

	"github.com/hieudoanm/omni/packages/cli/src/libs/requests"
	"github.com/spf13/cobra"
)

type LiveStreamer struct {
	ID     string  `json:"id"`
	Name   string  `json:"name"`
	Title  *string `json:"title,omitempty"`
	Patron bool    `json:"patron,omitempty"`
	Stream *struct {
		Service string `json:"service"`
		Status  string `json:"status"`
		Lang    string `json:"lang,omitempty"`
	} `json:"stream,omitempty"`
	Streamer *struct {
		Name     string `json:"name"`
		Headline string `json:"headline"`
		Twitch   string `json:"twitch,omitempty"`
		Youtube  string `json:"youtube,omitempty"`
	} `json:"streamer,omitempty"`
}

func runStreamer(cmd *cobra.Command, args []string) error {
	jsonOut, _ := cmd.Flags().GetBool("json")

	body, err := requests.Get("https://lichess.org/api/streamer/live", requests.Options{})
	if err != nil {
		return fmt.Errorf("failed to fetch live streamers: %w", err)
	}

	var streamers []LiveStreamer
	if err := json.Unmarshal(body, &streamers); err != nil {
		return fmt.Errorf("failed to parse streamers: %w", err)
	}

	if jsonOut {
		b, _ := json.MarshalIndent(streamers, "", "  ")
		fmt.Println(string(b))
		return nil
	}

	fmt.Println()
	fmt.Println("♞ Live Streamers")
	fmt.Println("------------------------------------------------")

	for _, s := range streamers {
		title := ""
		if s.Title != nil {
			title = " (" + *s.Title + ")"
		}
		streamInfo := ""
		if s.Stream != nil {
			streamInfo = fmt.Sprintf(" [%s] %s", s.Stream.Service, s.Stream.Status)
		}
		fmt.Printf("  %s%s%s\n", s.Name, title, streamInfo)
	}

	if len(streamers) == 0 {
		fmt.Println("  No live streamers right now.")
	}

	return nil
}
