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

	callbackQueryID, _ := cmd.Flags().GetString("callback-query-id")
	text, _ := cmd.Flags().GetString("text")
	showAlert, _ := cmd.Flags().GetBool("show-alert")
	url, _ := cmd.Flags().GetString("url")
	cacheTime, _ := cmd.Flags().GetInt("cache-time")

	if callbackQueryID == "" {
		return fmt.Errorf("--callback-query-id is required")
	}

	body := map[string]interface{}{
		"callback_query_id": callbackQueryID,
	}
	if text != "" {
		body["text"] = text
	}
	if showAlert {
		body["show_alert"] = true
	}
	if url != "" {
		body["url"] = url
	}
	if cacheTime != 0 {
		body["cache_time"] = cacheTime
	}

	apiURL := internal.TelegramAPIURL(token, "answerCallbackQuery")
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
