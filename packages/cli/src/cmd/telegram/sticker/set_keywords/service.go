package set_keywords

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
	keywordsJSON, _ := cmd.Flags().GetString("keywords")

	if sticker == "" {
		return fmt.Errorf("--sticker is required")
	}
	if keywordsJSON == "" {
		return fmt.Errorf("--keywords is required (JSON array)")
	}

	var keywords []string
	if err := json.Unmarshal([]byte(keywordsJSON), &keywords); err != nil {
		return fmt.Errorf("invalid --keywords JSON: %w", err)
	}

	body := map[string]interface{}{
		"sticker":  sticker,
		"keywords": keywords,
	}

	url := internal.TelegramAPIURL(token, "setStickerKeywords")
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
