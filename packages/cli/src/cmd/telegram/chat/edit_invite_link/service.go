package edit_invite_link

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
	inviteLink, _ := cmd.Flags().GetString("invite-link")

	if chatID == "" {
		return fmt.Errorf("--chat-id is required")
	}
	if inviteLink == "" {
		return fmt.Errorf("--invite-link is required")
	}

	body := map[string]interface{}{
		"chat_id":     chatID,
		"invite_link": inviteLink,
	}

	if name, _ := cmd.Flags().GetString("name"); name != "" {
		body["name"] = name
	}
	if expireDate, _ := cmd.Flags().GetInt64("expire-date"); expireDate != 0 {
		body["expire_date"] = expireDate
	}
	if memberLimit, _ := cmd.Flags().GetInt("member-limit"); memberLimit != 0 {
		body["member_limit"] = memberLimit
	}
	if createsJoinRequest, _ := cmd.Flags().GetBool("creates-join-request"); createsJoinRequest {
		body["creates_join_request"] = true
	}

	url := internal.TelegramAPIURL(token, "editChatInviteLink")
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
		if link, ok := result["result"].(map[string]interface{}); ok {
			fmt.Printf("Invite link: %v\n", link["invite_link"])
		} else {
			fmt.Println("Success")
		}
	}
	return nil
}
