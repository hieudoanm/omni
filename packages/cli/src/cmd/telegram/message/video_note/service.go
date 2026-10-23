package video_note

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
	videoNote, _ := cmd.Flags().GetString("video-note")
	duration, _ := cmd.Flags().GetInt("duration")
	length, _ := cmd.Flags().GetInt("length")
	thumbnail, _ := cmd.Flags().GetString("thumbnail")
	disableNotification, _ := cmd.Flags().GetBool("disable-notification")
	protectContent, _ := cmd.Flags().GetBool("protect-content")
	replyToMessageID, _ := cmd.Flags().GetInt("reply-to-message-id")

	if chatID == "" {
		return fmt.Errorf("--chat-id is required")
	}
	if videoNote == "" {
		return fmt.Errorf("--video-note is required")
	}

	body := map[string]interface{}{
		"chat_id":    chatID,
		"video_note": videoNote,
	}
	if duration != 0 {
		body["duration"] = duration
	}
	if length != 0 {
		body["length"] = length
	}
	if thumbnail != "" {
		body["thumbnail"] = thumbnail
	}
	if disableNotification {
		body["disable_notification"] = true
	}
	if protectContent {
		body["protect_content"] = true
	}
	if replyToMessageID != 0 {
		body["reply_to_message_id"] = replyToMessageID
	}

	url := internal.TelegramAPIURL(token, "sendVideoNote")
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
