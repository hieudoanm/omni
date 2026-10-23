package validate

import (
	"encoding/json"
	"fmt"
	"os"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/openapi/internal"
	"github.com/spf13/cobra"
)

func NewCommand() *cobra.Command {
	var file string
	cmd := &cobra.Command{
		Use:   "validate [--file <file>]",
		Short: "Validate an OpenAPI specification",
		Long:  `Parse and validate an OpenAPI specification file (JSON or YAML). Checks for required fields (openapi, info, paths), valid operation methods, operationId uniqueness, and response definitions.`,
		Example: `  openapi validate -f spec.yaml
  openapi validate -f openapi.json
  openapi validate -f petstore-v3.yaml --json`,
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")

			data, err := os.ReadFile(file)
			if err != nil {
				return err
			}

			spec, err := internal.ParseOpenAPI(data)
			if err != nil {
				return fmt.Errorf("parse error: %w", err)
			}

			issues := validateSpec(spec)
			if len(issues) == 0 {
				if jsonOutput {
					out, _ := json.Marshal(map[string]interface{}{"valid": true, "message": "valid openapi spec"})
					fmt.Println(string(out))
				} else {
					fmt.Println("valid openapi spec")
				}
				return nil
			}

			if jsonOutput {
				out, _ := json.Marshal(map[string]interface{}{"valid": false, "issues": issues, "count": len(issues)})
				fmt.Println(string(out))
			} else {
				for _, issue := range issues {
					fmt.Fprintln(os.Stderr, issue)
				}
			}
			return fmt.Errorf("%d validation issue(s) found", len(issues))
		},
	}

	cmd.Flags().StringVarP(&file, "file", "f", "", "OpenAPI spec file")
	return cmd
}
