package set_commands

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

	commandsJSON, _ := cmd.Flags().GetString("commands")
	scope, _ := cmd.Flags().GetString("scope")
	languageCode, _ := cmd.Flags().GetString("language-code")

	if commandsJSON == "" {
		return fmt.Errorf("--commands is required (JSON array)")
	}

	var commands []map[string]interface{}
	if err := json.Unmarshal([]byte(commandsJSON), &commands); err != nil {
		return fmt.Errorf("invalid --commands JSON: %w", err)
	}

	body := map[string]interface{}{
		"commands": commands,
	}
	if scope != "" {
		var scopeObj map[string]interface{}
		if err := json.Unmarshal([]byte(scope), &scopeObj); err != nil {
			return fmt.Errorf("invalid --scope JSON: %w", err)
		}
		body["scope"] = scopeObj
	}
	if languageCode != "" {
		body["language_code"] = languageCode
	}

	url := internal.TelegramAPIURL(token, "setMyCommands")
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
