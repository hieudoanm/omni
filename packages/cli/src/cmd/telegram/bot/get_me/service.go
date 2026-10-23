package get_me

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

	url := internal.TelegramAPIURL(token, "getMe")
	responseByte, postErr := requests.Get(url, requests.Options{})
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
		var result map[string]interface{}
		if err := json.Unmarshal(responseByte, &result); err != nil {
			return err
		}
		if info, ok := result["result"].(map[string]interface{}); ok {
			fmt.Printf("ID: %v\n", info["id"])
			fmt.Printf("Username: @%v\n", info["username"])
			fmt.Printf("First name: %v\n", info["first_name"])
			if isBot, ok := info["is_bot"]; ok {
				fmt.Printf("Is bot: %v\n", isBot)
			}
		} else {
			fmt.Println("Success")
		}
	}
	return nil
}
