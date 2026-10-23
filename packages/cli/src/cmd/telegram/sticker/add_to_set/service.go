package add_to_set

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

	userID, _ := cmd.Flags().GetInt64("user-id")
	name, _ := cmd.Flags().GetString("name")
	stickerJSON, _ := cmd.Flags().GetString("sticker")

	if userID == 0 {
		return fmt.Errorf("--user-id is required")
	}
	if name == "" {
		return fmt.Errorf("--name is required")
	}
	if stickerJSON == "" {
		return fmt.Errorf("--sticker is required (JSON object)")
	}

	var sticker map[string]interface{}
	if err := json.Unmarshal([]byte(stickerJSON), &sticker); err != nil {
		return fmt.Errorf("invalid --sticker JSON: %w", err)
	}

	body := map[string]interface{}{
		"user_id": userID,
		"name":    name,
		"sticker": sticker,
	}

	url := internal.TelegramAPIURL(token, "addStickerToSet")
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
