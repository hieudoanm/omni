package get

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

	chatID, _ := cmd.Flags().GetString("chat-id")
	if chatID == "" {
		return fmt.Errorf("--chat-id is required")
	}

	body := map[string]interface{}{
		"chat_id": chatID,
	}

	url := internal.TelegramAPIURL(token, "getChat")
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
		var result map[string]interface{}
		if err := json.Unmarshal(responseByte, &result); err != nil {
			return err
		}
		if info, ok := result["result"].(map[string]interface{}); ok {
			fmt.Printf("ID: %v\n", info["id"])
			fmt.Printf("Type: %v\n", info["type"])
			if title, ok := info["title"]; ok {
				fmt.Printf("Title: %v\n", title)
			}
			if username, ok := info["username"]; ok {
				fmt.Printf("Username: %v\n", username)
			}
		} else {
			fmt.Println("Success")
		}
	}
	return nil
}
