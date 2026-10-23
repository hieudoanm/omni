package delete

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

func runE(cmd *cobra.Command, args []string) error {
	jsonOutput, _ := cmd.Flags().GetBool("json")

	token, err := internal.ResolveToken(cmd)
	if err != nil {
		return err
	}

	url := internal.TelegramAPIURL(token, "deleteWebhook")
	responseByte, postErr := requests.Post(url, requests.Options{})
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
		var deleteResponse DeleteResponse
		if err := json.Unmarshal(responseByte, &deleteResponse); err != nil {
			return err
		}
		if deleteResponse.Ok {
			fmt.Println("Success")
		} else {
			fmt.Println("Failed")
		}
	}
	return nil
}
