package high_scores

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
	chatID, _ := cmd.Flags().GetString("chat-id")
	messageID, _ := cmd.Flags().GetInt("message-id")
	inlineMessageID, _ := cmd.Flags().GetString("inline-message-id")

	if userID == 0 {
		return fmt.Errorf("--user-id is required")
	}

	body := map[string]interface{}{
		"user_id": userID,
	}
	if chatID != "" {
		body["chat_id"] = chatID
	}
	if messageID != 0 {
		body["message_id"] = messageID
	}
	if inlineMessageID != "" {
		body["inline_message_id"] = inlineMessageID
	}

	url := internal.TelegramAPIURL(token, "getGameHighScores")
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
		var result map[string]interface{}
		if err := json.Unmarshal(responseByte, &result); err != nil {
			return err
		}
		if scores, ok := result["result"].([]interface{}); ok {
			for i, s := range scores {
				if entry, ok := s.(map[string]interface{}); ok {
					fmt.Printf("%d. User %v: %v\n", i+1, entry["user"], entry["score"])
				}
			}
		} else {
			fmt.Println("Success")
		}
	}
	return nil
}
