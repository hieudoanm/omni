package set_description

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

	description, _ := cmd.Flags().GetString("description")
	languageCode, _ := cmd.Flags().GetString("language-code")

	if description == "" {
		return fmt.Errorf("--description is required")
	}

	body := map[string]interface{}{
		"description": description,
	}
	if languageCode != "" {
		body["language_code"] = languageCode
	}

	url := internal.TelegramAPIURL(token, "setMyDescription")
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
