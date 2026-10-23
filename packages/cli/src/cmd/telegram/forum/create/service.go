package create

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
	name, _ := cmd.Flags().GetString("name")
	iconColor, _ := cmd.Flags().GetInt("icon-color")
	iconCustomEmojiID, _ := cmd.Flags().GetString("icon-custom-emoji-id")

	if chatID == "" {
		return fmt.Errorf("--chat-id is required")
	}
	if name == "" {
		return fmt.Errorf("--name is required")
	}

	body := map[string]interface{}{
		"chat_id": chatID,
		"name":    name,
	}
	if iconColor != 0 {
		body["icon_color"] = iconColor
	}
	if iconCustomEmojiID != "" {
		body["icon_custom_emoji_id"] = iconCustomEmojiID
	}

	url := internal.TelegramAPIURL(token, "createForumTopic")
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
