package tv

import (
	"encoding/json"
	"fmt"

	"github.com/hieudoanm/omni/packages/cli/src/libs/requests"
	"github.com/spf13/cobra"
)

type TvGame struct {
	User   LightUser `json:"user"`
	Rating int       `json:"rating"`
	GameId string    `json:"gameId"`
}

type LightUser struct {
	ID    string  `json:"id"`
	Name  string  `json:"name"`
	Title *string `json:"title,omitempty"`
}

type TvChannels struct {
	Bullet        TvGame `json:"bullet"`
	Blitz         TvGame `json:"blitz"`
	Rapid         TvGame `json:"rapid"`
	Classical     TvGame `json:"classical"`
	UltraBullet   TvGame `json:"ultraBullet"`
	Crazyhouse    TvGame `json:"crazyhouse"`
	Chess960      TvGame `json:"chess960"`
	KingOfTheHill TvGame `json:"kingOfTheHill"`
	ThreeCheck    TvGame `json:"threeCheck"`
	Antichess     TvGame `json:"antichess"`
	Atomic        TvGame `json:"atomic"`
	Horde         TvGame `json:"horde"`
	RacingKings   TvGame `json:"racingKings"`
	Best          TvGame `json:"best"`
}

func runTv(cmd *cobra.Command, args []string) error {
	jsonOut, _ := cmd.Flags().GetBool("json")

	body, err := requests.Get("https://lichess.org/api/tv/channels", requests.Options{})
	if err != nil {
		return fmt.Errorf("failed to fetch TV channels: %w", err)
	}

	var ch TvChannels
	if err := json.Unmarshal(body, &ch); err != nil {
		return fmt.Errorf("failed to parse TV channels: %w", err)
	}

	if jsonOut {
		b, _ := json.MarshalIndent(ch, "", "  ")
		fmt.Println(string(b))
		return nil
	}

	fmt.Println()
	fmt.Println("♞ Lichess TV")
	fmt.Println("------------------------------------------------")

	show := func(name string, g TvGame) {
		title := ""
		if g.User.Title != nil {
			title = " " + *g.User.Title
		}
		fmt.Printf("  %-16s %s%s (%d)  game: %s\n", name+":", g.User.Name, title, g.Rating, g.GameId)
	}

	show("Bullet", ch.Bullet)
	show("Blitz", ch.Blitz)
	show("Rapid", ch.Rapid)
	show("Classical", ch.Classical)
	show("UltraBullet", ch.UltraBullet)
	show("Crazyhouse", ch.Crazyhouse)
	show("Chess960", ch.Chess960)
	show("King Of The Hill", ch.KingOfTheHill)
	show("Three Check", ch.ThreeCheck)
	show("Antichess", ch.Antichess)
	show("Atomic", ch.Atomic)
	show("Horde", ch.Horde)
	show("Racing Kings", ch.RacingKings)

	return nil
}
