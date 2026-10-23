package profile

import (
	"encoding/json"
	"fmt"
	"net/url"

	"github.com/hieudoanm/omni/packages/cli/src/libs/requests"
	"github.com/spf13/cobra"
)

type User struct {
	ID        string          `json:"id"`
	Username  string          `json:"username"`
	Perfs     map[string]Perf `json:"perfs,omitempty"`
	Title     *string         `json:"title,omitempty"`
	CreatedAt int64           `json:"createdAt,omitempty"`
	SeenAt    int64           `json:"seenAt,omitempty"`
	Patron    bool            `json:"patron,omitempty"`
	PlayTime  *PlayTime       `json:"playTime,omitempty"`
	Profile   *ProfileInfo    `json:"profile,omitempty"`
	Count     *Count          `json:"count,omitempty"`
	URL       string          `json:"url"`
	Playing   string          `json:"playing,omitempty"`
	Streaming bool            `json:"streaming,omitempty"`
}

type Count struct {
	All      int `json:"all"`
	Rated    int `json:"rated"`
	Win      int `json:"win"`
	Loss     int `json:"loss"`
	Draw     int `json:"draw"`
	Playing  int `json:"playing"`
	Bookmark int `json:"bookmark"`
	Import   int `json:"import"`
}

type PlayTime struct {
	Total int `json:"total"`
	Tv    int `json:"tv"`
}

type ProfileInfo struct {
	Bio       string `json:"bio,omitempty"`
	Country   string `json:"country,omitempty"`
	FirstName string `json:"firstName,omitempty"`
	LastName  string `json:"lastName,omitempty"`
	Location  string `json:"location,omitempty"`
}

type Perf struct {
	Games  int   `json:"games"`
	Rating int   `json:"rating"`
	Rd     int   `json:"rd"`
	Prog   int   `json:"prog"`
	Prov   *bool `json:"prov,omitempty"`
}

func runProfile(cmd *cobra.Command, args []string) error {
	jsonOut, _ := cmd.Flags().GetBool("json")
	username := args[0]

	apiURL := fmt.Sprintf("https://lichess.org/api/user/%s", url.PathEscape(username))
	body, err := requests.Get(apiURL, requests.Options{})
	if err != nil {
		return fmt.Errorf("failed to fetch user: %w", err)
	}

	var u User
	if err := json.Unmarshal(body, &u); err != nil {
		return fmt.Errorf("failed to parse user: %w", err)
	}

	if jsonOut {
		b, _ := json.MarshalIndent(u, "", "  ")
		fmt.Println(string(b))
		return nil
	}

	fmt.Println()
	fmt.Printf("♞ %s", u.Username)
	if u.Title != nil {
		fmt.Printf(" (%s)", *u.Title)
	}
	fmt.Println()
	fmt.Println("------------------------------------------------")

	if u.Profile != nil {
		if u.Profile.FirstName != "" || u.Profile.LastName != "" {
			fmt.Printf("Name     : %s %s\n", u.Profile.FirstName, u.Profile.LastName)
		}
		if u.Profile.Location != "" {
			fmt.Printf("Location : %s\n", u.Profile.Location)
		}
		if u.Profile.Country != "" {
			fmt.Printf("Country  : %s\n", u.Profile.Country)
		}
	}

	fmt.Printf("Patron   : %v\n", u.Patron)

	if u.PlayTime != nil {
		fmt.Printf("PlayTime : %dh total, %dh TV\n", u.PlayTime.Total/3600, u.PlayTime.Tv/3600)
	}

	fmt.Println()
	fmt.Println("Ratings:")
	for perf, p := range u.Perfs {
		prov := ""
		if p.Prov != nil && *p.Prov {
			prov = "?"
		}
		fmt.Printf("  %-16s %d%s\n", perf+":", p.Rating, prov)
	}

	if u.Count != nil {
		fmt.Println()
		fmt.Printf("Games    : %d total, %d rated\n", u.Count.All, u.Count.Rated)
		fmt.Printf("Record   : %dW/%dL/%dD\n", u.Count.Win, u.Count.Loss, u.Count.Draw)
	}

	return nil
}
