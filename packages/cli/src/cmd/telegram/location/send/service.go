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

	chatID, _ := cmd.Flags().GetString("chat-id")
	latitude, _ := cmd.Flags().GetFloat64("latitude")
	longitude, _ := cmd.Flags().GetFloat64("longitude")
	horizontalAccuracy, _ := cmd.Flags().GetFloat64("horizontal-accuracy")
	livePeriod, _ := cmd.Flags().GetInt("live-period")
	heading, _ := cmd.Flags().GetInt("heading")
	proximityAlertRadius, _ := cmd.Flags().GetInt("proximity-alert-radius")
	disableNotification, _ := cmd.Flags().GetBool("disable-notification")
	protectContent, _ := cmd.Flags().GetBool("protect-content")
	replyToMessageID, _ := cmd.Flags().GetInt("reply-to-message-id")

	if chatID == "" {
		return fmt.Errorf("--chat-id is required")
	}

	body := map[string]interface{}{
		"chat_id":   chatID,
		"latitude":  latitude,
		"longitude": longitude,
	}
	if horizontalAccuracy != 0 {
		body["horizontal_accuracy"] = horizontalAccuracy
	}
	if livePeriod != 0 {
		body["live_period"] = livePeriod
	}
	if heading != 0 {
		body["heading"] = heading
	}
	if proximityAlertRadius != 0 {
		body["proximity_alert_radius"] = proximityAlertRadius
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

	url := internal.TelegramAPIURL(token, "sendLocation")
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
