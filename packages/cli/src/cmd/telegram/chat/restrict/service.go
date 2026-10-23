package restrict

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
	permissionsJSON, _ := cmd.Flags().GetString("permissions")
	untilDate, _ := cmd.Flags().GetInt64("until-date")
	useIndependentChatPermissions, _ := cmd.Flags().GetBool("use-independent-chat-permissions")

	if chatID == "" {
		return fmt.Errorf("--chat-id is required")
	}
	if userID == 0 {
		return fmt.Errorf("--user-id is required")
	}
	if permissionsJSON == "" {
		return fmt.Errorf("--permissions is required (JSON object)")
	}

	var permissions map[string]interface{}
	if err := json.Unmarshal([]byte(permissionsJSON), &permissions); err != nil {
		return fmt.Errorf("invalid --permissions JSON: %w", err)
	}

	body := map[string]interface{}{
		"chat_id":     chatID,
		"user_id":     userID,
		"permissions": permissions,
	}
	if untilDate != 0 {
		body["until_date"] = untilDate
	}
	if useIndependentChatPermissions {
		body["use_independent_chat_permissions"] = true
	}

	url := internal.TelegramAPIURL(token, "restrictChatMember")
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
