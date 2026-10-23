package send

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

	userID, _ := cmd.Flags().GetInt64("user-id")
	giftID, _ := cmd.Flags().GetString("gift-id")
	text, _ := cmd.Flags().GetString("text")
	textParseMode, _ := cmd.Flags().GetString("text-parse-mode")
	protectContent, _ := cmd.Flags().GetBool("protect-content")

	if userID == 0 {
		return fmt.Errorf("--user-id is required")
	}
	if giftID == "" {
		return fmt.Errorf("--gift-id is required")
	}

	body := map[string]interface{}{
		"user_id": userID,
		"gift_id": giftID,
	}
	if text != "" {
		body["text"] = text
	}
	if textParseMode != "" {
		body["text_parse_mode"] = textParseMode
	}
	if protectContent {
		body["protect_content"] = true
	}

	url := internal.TelegramAPIURL(token, "sendGift")
	responseByte, postErr := requests.Post(url, requests.Options{Body: body})
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
