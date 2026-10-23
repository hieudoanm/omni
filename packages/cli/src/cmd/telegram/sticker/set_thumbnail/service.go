package set_thumbnail

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

	name, _ := cmd.Flags().GetString("name")
	userID, _ := cmd.Flags().GetInt64("user-id")
	thumbnail, _ := cmd.Flags().GetString("thumbnail")
	format, _ := cmd.Flags().GetString("format")

	if name == "" {
		return fmt.Errorf("--name is required (sticker set short name)")
	}
	if userID == 0 {
		return fmt.Errorf("--user-id is required")
	}
	if thumbnail == "" {
		return fmt.Errorf("--thumbnail is required")
	}
	if format == "" {
		format = "static"
	}

	body := map[string]interface{}{
		"name":      name,
		"user_id":   userID,
		"thumbnail": thumbnail,
		"format":    format,
	}

	url := internal.TelegramAPIURL(token, "setStickerSetThumbnail")
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
