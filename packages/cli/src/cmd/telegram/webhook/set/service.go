package set

import (
	"encoding/json"
	"fmt"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/internal"
	"github.com/hieudoanm/omni/packages/cli/src/libs/requests"
	"github.com/spf13/cobra"
)

type SetResponse struct {
	Ok bool `json:"ok"`
}

func runE(cmd *cobra.Command, args []string) error {
	jsonOutput, _ := cmd.Flags().GetBool("json")

	token, err := internal.ResolveToken(cmd)
	if err != nil {
		return err
	}

	webhookURL, _ := cmd.Flags().GetString("url")
	if webhookURL == "" {
		return fmt.Errorf("--url is required")
	}

	url := internal.TelegramAPIURL(token, "setWebhook")
	body := map[string]string{"url": webhookURL}
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
		var setResponse SetResponse
		if err := json.Unmarshal(responseByte, &setResponse); err != nil {
			return err
		}
		if setResponse.Ok {
			fmt.Println("Success")
		} else {
			fmt.Println("Failed")
		}
	}
	return nil
}
