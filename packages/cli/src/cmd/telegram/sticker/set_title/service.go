package set_title

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
	title, _ := cmd.Flags().GetString("title")

	if name == "" {
		return fmt.Errorf("--name is required (sticker set short name)")
	}
	if title == "" {
		return fmt.Errorf("--title is required")
	}

	body := map[string]interface{}{
		"name":  name,
		"title": title,
	}

	url := internal.TelegramAPIURL(token, "setStickerSetTitle")
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
