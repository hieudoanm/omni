package status

import (
	"encoding/json"
	"fmt"
	"net/url"
	"strings"

	"github.com/hieudoanm/omni/packages/cli/src/libs/requests"
	"github.com/spf13/cobra"
)

type UserStatus struct {
	ID      string  `json:"id"`
	Name    string  `json:"name"`
	Title   *string `json:"title,omitempty"`
	Online  bool    `json:"online,omitempty"`
	Playing bool    `json:"playing,omitempty"`
	Patron  bool    `json:"patron,omitempty"`
}

func runStatus(cmd *cobra.Command, args []string) error {
	jsonOut, _ := cmd.Flags().GetBool("json")
	ids := strings.Join(args, ",")

	apiURL := fmt.Sprintf("https://lichess.org/api/users/status?ids=%s", url.QueryEscape(ids))
	body, err := requests.Get(apiURL, requests.Options{})
	if err != nil {
		return fmt.Errorf("failed to fetch status: %w", err)
	}

	var statuses []UserStatus
	if err := json.Unmarshal(body, &statuses); err != nil {
		return fmt.Errorf("failed to parse status: %w", err)
	}

	if jsonOut {
		b, _ := json.MarshalIndent(statuses, "", "  ")
		fmt.Println(string(b))
		return nil
	}

	fmt.Println()
	fmt.Println("♞ User Status")
	fmt.Println("------------------------------------------------")
	for _, s := range statuses {
		title := ""
		if s.Title != nil {
			title = " (" + *s.Title + ")"
		}
		online := "offline"
		if s.Online {
			online = "online"
		}
		if s.Playing {
			online = "playing"
		}
		fmt.Printf("  %s%s  %s\n", s.Name, title, online)
	}

	return nil
}
