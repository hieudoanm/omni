package answer

import (
	"encoding/json"
	"fmt"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/internal"
	"github.com/hieudoanm/omni/packages/cli/src/libs/requests"
	"github.com/spf13/cobra"
)

func runE(cmd *cobra.Command, args []string) error {
	jsonOutput, _ := cmd.Flags().GetBool("json")

	token, err := internal.ResolveToken(cmd)
	if err != nil {
		return err
	}

	inlineQueryID, _ := cmd.Flags().GetString("inline-query-id")
	resultsJSON, _ := cmd.Flags().GetString("results")
	cacheTime, _ := cmd.Flags().GetInt("cache-time")
	isPersonal, _ := cmd.Flags().GetBool("is-personal")
	nextOffset, _ := cmd.Flags().GetString("next-offset")
	buttonJSON, _ := cmd.Flags().GetString("button")

	if inlineQueryID == "" {
		return fmt.Errorf("--inline-query-id is required")
	}
	if resultsJSON == "" {
		return fmt.Errorf("--results is required (JSON array)")
	}

	var results []interface{}
	if err := json.Unmarshal([]byte(resultsJSON), &results); err != nil {
		return fmt.Errorf("invalid --results JSON: %w", err)
	}

	body := map[string]interface{}{
		"inline_query_id": inlineQueryID,
		"results":         results,
	}
	if cacheTime != 0 {
		body["cache_time"] = cacheTime
	}
	if isPersonal {
		body["is_personal"] = true
	}
	if nextOffset != "" {
		body["next_offset"] = nextOffset
	}
	if buttonJSON != "" {
		var button map[string]interface{}
		if err := json.Unmarshal([]byte(buttonJSON), &button); err != nil {
			return fmt.Errorf("invalid --button JSON: %w", err)
		}
		body["button"] = button
	}

	apiURL := internal.TelegramAPIURL(token, "answerInlineQuery")
	responseByte, postErr := requests.Post(apiURL, requests.Options{Body: body})
	if postErr != nil {
		return postErr
	}

	if jsonOutput {
		var result map[string]interface{}
		if err := json.Unmarshal(responseByte, &result); err != nil {
			return err
		}
		out, _ := json.MarshalIndent(result, "", "  ")
		fmt.Println(string(out))
	} else {
		fmt.Println("Success")
	}
	return nil
}
