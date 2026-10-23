package study

import (
	"fmt"

	"github.com/hieudoanm/omni/packages/cli/src/libs/requests"
	"github.com/spf13/cobra"
)

func runStudy(cmd *cobra.Command, args []string) error {
	studyID := args[0]

	body, err := requests.Get(
		fmt.Sprintf("https://lichess.org/api/study/%s.pgn", studyID),
		requests.Options{},
	)
	if err != nil {
		return fmt.Errorf("failed to fetch study: %w", err)
	}

	fmt.Println(string(body))

	return nil
}
