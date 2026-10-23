package unban

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
	userID, _ := cmd.Flags().GetInt64("user-id")
	onlyIfBanned, _ := cmd.Flags().GetBool("only-if-banned")

	if chatID == "" {
		return fmt.Errorf("--chat-id is required")
	}
	if userID == 0 {
		return fmt.Errorf("--user-id is required")
	}

	body := map[string]interface{}{
		"chat_id": chatID,
		"user_id": userID,
	}
	if onlyIfBanned {
		body["only_if_banned"] = true
	}

	url := internal.TelegramAPIURL(token, "unbanChatMember")
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
