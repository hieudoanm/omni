package send

import (
	"encoding/json"
	"fmt"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/internal"
	"github.com/hieudoanm/omni/packages/cli/src/libs/requests"
	"github.com/spf13/cobra"
)

type DeleteResponse struct {
	Ok bool `json:"ok"`
}

type SendResponse struct {
	Ok bool `json:"ok"`
}

func runE(cmd *cobra.Command, args []string) error {
	jsonOutput, _ := cmd.Flags().GetBool("json")

	token, err := internal.ResolveToken(cmd)
	if err != nil {
		return err
	}

	chatID, _ := cmd.Flags().GetString("chat-id")
	text, _ := cmd.Flags().GetString("text")
	parseMode, _ := cmd.Flags().GetString("parse-mode")
	disableWebPagePreview, _ := cmd.Flags().GetBool("disable-web-page-preview")
	disableNotification, _ := cmd.Flags().GetBool("disable-notification")
	protectContent, _ := cmd.Flags().GetBool("protect-content")
	replyToMessageID, _ := cmd.Flags().GetInt("reply-to-message-id")

	if chatID == "" {
		return fmt.Errorf("--chat-id is required")
	}
	if text == "" {
		return fmt.Errorf("--text is required")
	}

	body := map[string]interface{}{
		"chat_id": chatID,
		"text":    text,
	}
	if parseMode != "" {
		body["parse_mode"] = parseMode
	}
	if disableWebPagePreview {
		body["disable_web_page_preview"] = true
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

	url := internal.TelegramAPIURL(token, "sendMessage")
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
		var sendResponse SendResponse
		if err := json.Unmarshal(responseByte, &sendResponse); err != nil {
			return err
		}
		if sendResponse.Ok {
			fmt.Println("Success")
		} else {
			fmt.Println("Failed")
		}
	}
	return nil
}
