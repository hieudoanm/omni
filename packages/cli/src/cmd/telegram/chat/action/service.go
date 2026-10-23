package action

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
	action, _ := cmd.Flags().GetString("action")

	if chatID == "" {
		return fmt.Errorf("--chat-id is required")
	}
	if action == "" {
		return fmt.Errorf("--action is required (typing, upload_photo, record_video, upload_video, record_voice, upload_voice, upload_document, choose_sticker, find_location, record_video_note, upload_video_note)")
	}

	body := map[string]interface{}{
		"chat_id": chatID,
		"action":  action,
	}

	url := internal.TelegramAPIURL(token, "sendChatAction")
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
