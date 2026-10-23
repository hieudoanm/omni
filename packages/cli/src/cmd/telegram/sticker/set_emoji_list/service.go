package set_emoji_list

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

	sticker, _ := cmd.Flags().GetString("sticker")
	emojiListJSON, _ := cmd.Flags().GetString("emoji-list")

	if sticker == "" {
		return fmt.Errorf("--sticker is required")
	}
	if emojiListJSON == "" {
		return fmt.Errorf("--emoji-list is required (JSON array)")
	}

	var emojiList []string
	if err := json.Unmarshal([]byte(emojiListJSON), &emojiList); err != nil {
		return fmt.Errorf("invalid --emoji-list JSON: %w", err)
	}

	body := map[string]interface{}{
		"sticker":    sticker,
		"emoji_list": emojiList,
	}

	url := internal.TelegramAPIURL(token, "setStickerEmojiList")
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
