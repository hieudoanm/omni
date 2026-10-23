package top10

import (
	"encoding/json"
	"fmt"

	"github.com/hieudoanm/omni/packages/cli/src/libs/requests"
	"github.com/spf13/cobra"
)

type TopUser struct {
	ID       string  `json:"id"`
	Username string  `json:"username"`
	Title    *string `json:"title,omitempty"`
	Rating   int     `json:"rating"`
	Progress int     `json:"progress"`
	Online   bool    `json:"online,omitempty"`
}

type PerfTop10 [10]TopUser

type Top10s struct {
	Bullet        PerfTop10 `json:"bullet"`
	Blitz         PerfTop10 `json:"blitz"`
	Rapid         PerfTop10 `json:"rapid"`
	Classical     PerfTop10 `json:"classical"`
	UltraBullet   PerfTop10 `json:"ultraBullet"`
	Crazyhouse    PerfTop10 `json:"crazyhouse"`
	Chess960      PerfTop10 `json:"chess960"`
	KingOfTheHill PerfTop10 `json:"kingOfTheHill"`
	ThreeCheck    PerfTop10 `json:"threeCheck"`
	Antichess     PerfTop10 `json:"antichess"`
	Atomic        PerfTop10 `json:"atomic"`
	Horde         PerfTop10 `json:"horde"`
	RacingKings   PerfTop10 `json:"racingKings"`
}

var perfNames = []string{
	"bullet", "blitz", "rapid", "classical", "ultraBullet",
	"crazyhouse", "chess960", "kingOfTheHill", "threeCheck",
	"antichess", "atomic", "horde", "racingKings",
}

func runTop10(cmd *cobra.Command, args []string) error {
	jsonOut, _ := cmd.Flags().GetBool("json")

	body, err := requests.Get("https://lichess.org/api/player", requests.Options{})
	if err != nil {
		return fmt.Errorf("failed to fetch top players: %w", err)
	}

	var data Top10s
	if err := json.Unmarshal(body, &data); err != nil {
		return fmt.Errorf("failed to parse top players: %w", err)
	}

	if jsonOut {
		b, _ := json.MarshalIndent(data, "", "  ")
		fmt.Println(string(b))
		return nil
	}

	fmt.Println()
	fmt.Println("♞ Lichess Top 10")
	fmt.Println("------------------------------------------------")

	getTop10 := func(name string, t PerfTop10) {
		if t[0].Username == "" {
			return
		}
		fmt.Printf("\n%s:\n", name)
		for i, u := range t {
			if u.Username == "" {
				break
			}
			title := ""
			if u.Title != nil {
				title = " " + *u.Title
			}
			online := ""
			if u.Online {
				online = " ●"
			}
			prog := ""
			if u.Progress > 0 {
				prog = fmt.Sprintf(" ▲%d", u.Progress)
			} else if u.Progress < 0 {
				prog = fmt.Sprintf(" ▼%d", -u.Progress)
			}
			fmt.Printf("  %2d. %s%s (%d)%s%s\n", i+1, u.Username, title, u.Rating, prog, online)
		}
	}

	getTop10("Bullet", data.Bullet)
	getTop10("Blitz", data.Blitz)
	getTop10("Rapid", data.Rapid)
	getTop10("Classical", data.Classical)
	getTop10("UltraBullet", data.UltraBullet)
	getTop10("Crazyhouse", data.Crazyhouse)
	getTop10("Chess960", data.Chess960)
	getTop10("King of the Hill", data.KingOfTheHill)
	getTop10("Three Check", data.ThreeCheck)
	getTop10("Antichess", data.Antichess)
	getTop10("Atomic", data.Atomic)
	getTop10("Horde", data.Horde)
	getTop10("Racing Kings", data.RacingKings)

	return nil
}
