package info

import (
	"encoding/json"
	"fmt"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/internal"
	"github.com/hieudoanm/omni/packages/cli/src/libs/requests"
	"github.com/spf13/cobra"
)

type GetInfoResponse struct {
	Ok bool `json:"ok"`
}

func runE(cmd *cobra.Command, args []string) error {
	jsonOutput, _ := cmd.Flags().GetBool("json")

	token, err := internal.ResolveToken(cmd)
	if err != nil {
		return err
	}

	url := internal.TelegramAPIURL(token, "getWebhookInfo")
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
		var getInfoResponse GetInfoResponse
		if err := json.Unmarshal(responseByte, &getInfoResponse); err != nil {
			return err
		}
		if getInfoResponse.Ok {
			var result map[string]interface{}
			if err := json.Unmarshal(responseByte, &result); err != nil {
				return err
			}
			if info, ok := result["result"].(map[string]interface{}); ok {
				fmt.Printf("URL: %v\n", info["url"])
				fmt.Printf("Pending updates: %v\n", info["pending_update_count"])
				if cert, ok := info["has_custom_certificate"]; ok {
					fmt.Printf("Custom certificate: %v\n", cert)
				}
			} else {
				fmt.Println("Success")
			}
		} else {
			fmt.Println("Failed")
		}
	}
	return nil
}
