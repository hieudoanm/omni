package team

import (
	"encoding/json"
	"fmt"

	"github.com/hieudoanm/omni/packages/cli/src/libs/requests"
	"github.com/spf13/cobra"
)

type Team struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description,omitempty"`
	NbMembers   int    `json:"nbMembers,omitempty"`
	Open        bool   `json:"open,omitempty"`
	Leader      struct {
		Name  string  `json:"name"`
		Title *string `json:"title,omitempty"`
	} `json:"leader,omitempty"`
}

func runTeam(cmd *cobra.Command, args []string) error {
	jsonOut, _ := cmd.Flags().GetBool("json")
	teamID := args[0]

	body, err := requests.Get(fmt.Sprintf("https://lichess.org/api/team/%s", teamID), requests.Options{})
	if err != nil {
		return fmt.Errorf("failed to fetch team: %w", err)
	}

	var t Team
	if err := json.Unmarshal(body, &t); err != nil {
		return fmt.Errorf("failed to parse team: %w", err)
	}

	if jsonOut {
		b, _ := json.MarshalIndent(t, "", "  ")
		fmt.Println(string(b))
		return nil
	}

	fmt.Println()
	fmt.Printf("♞ %s\n", t.Name)
	fmt.Println("------------------------------------------------")
	fmt.Printf("ID      : %s\n", t.ID)
	fmt.Printf("Members : %d\n", t.NbMembers)
	fmt.Printf("Open    : %v\n", t.Open)
	if t.Leader.Name != "" {
		title := ""
		if t.Leader.Title != nil {
			title = " " + *t.Leader.Title
		}
		fmt.Printf("Leader  : %s%s\n", t.Leader.Name, title)
	}
	if t.Description != "" {
		desc := t.Description
		if len(desc) > 200 {
			desc = desc[:200] + "..."
		}
		fmt.Printf("About   : %s\n", desc)
	}

	return nil
}
