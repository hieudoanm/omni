package shipping

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

	shippingQueryID, _ := cmd.Flags().GetString("shipping-query-id")
	ok, _ := cmd.Flags().GetBool("ok")
	shippingOptionsJSON, _ := cmd.Flags().GetString("shipping-options")
	errorMessage, _ := cmd.Flags().GetString("error-message")

	if shippingQueryID == "" {
		return fmt.Errorf("--shipping-query-id is required")
	}

	body := map[string]interface{}{
		"shipping_query_id": shippingQueryID,
		"ok":                ok,
	}
	if ok && shippingOptionsJSON != "" {
		var options []interface{}
		if err := json.Unmarshal([]byte(shippingOptionsJSON), &options); err != nil {
			return fmt.Errorf("invalid --shipping-options JSON: %w", err)
		}
		body["shipping_options"] = options
	}
	if !ok && errorMessage != "" {
		body["error_message"] = errorMessage
	}

	url := internal.TelegramAPIURL(token, "answerShippingQuery")
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
