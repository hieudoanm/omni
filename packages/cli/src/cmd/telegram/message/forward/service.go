package forward

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

	chatID, _ := cmd.Flags().GetString("chat-id")
	fromChatID, _ := cmd.Flags().GetString("from-chat-id")
	messageID, _ := cmd.Flags().GetInt("message-id")

	if chatID == "" {
		return fmt.Errorf("--chat-id is required")
	}
	if fromChatID == "" {
		return fmt.Errorf("--from-chat-id is required")
	}
	if messageID == 0 {
		return fmt.Errorf("--message-id is required")
	}

	body := map[string]interface{}{
		"chat_id":      chatID,
		"from_chat_id": fromChatID,
		"message_id":   messageID,
	}

	url := internal.TelegramAPIURL(token, "forwardMessage")
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
