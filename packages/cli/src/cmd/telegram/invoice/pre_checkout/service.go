package pre_checkout

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

	preCheckoutQueryID, _ := cmd.Flags().GetString("pre-checkout-query-id")
	ok, _ := cmd.Flags().GetBool("ok")
	errorMessage, _ := cmd.Flags().GetString("error-message")

	if preCheckoutQueryID == "" {
		return fmt.Errorf("--pre-checkout-query-id is required")
	}

	body := map[string]interface{}{
		"pre_checkout_query_id": preCheckoutQueryID,
		"ok":                    ok,
	}
	if !ok && errorMessage != "" {
		body["error_message"] = errorMessage
	}

	url := internal.TelegramAPIURL(token, "answerPreCheckoutQuery")
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
