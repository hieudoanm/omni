package postman

import (
	"encoding/json"
	"fmt"
	"os"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/openapi/internal"
	"github.com/spf13/cobra"
)

func NewCommand() *cobra.Command {
	var inputFile, outputFile string
	cmd := &cobra.Command{
		Use:   "openapi2postman",
		Short: "Convert OpenAPI to Postman collection",
		Long:  `Convert an OpenAPI specification (JSON or YAML) to a Postman v2.1 collection. Generates folders by tag, auto-generates example bodies from schemas, and preserves query/path/header parameters.`,
		Example: `  openapi openapi2postman -i spec.yaml
  openapi openapi2postman -i spec.yaml -o collection.json
  openapi openapi2postman -i petstore.yaml`,
		RunE: func(cmd *cobra.Command, args []string) error {
			if inputFile == "" {
				return fmt.Errorf("input file required (-i)")
			}

			data, err := os.ReadFile(inputFile)
			if err != nil {
				return err
			}

			spec, err := internal.ParseOpenAPI(data)
			if err != nil {
				return err
			}

			postman, err := convertToPostman(spec)
			if err != nil {
				return err
			}

			out, err := json.MarshalIndent(postman, "", "  ")
			if err != nil {
				return err
			}

			if outputFile == "" {
				fmt.Println(string(out))
				return nil
			}

			return os.WriteFile(outputFile, out, 0644)
		},
	}

	cmd.Flags().StringVarP(&inputFile, "input", "i", "", "OpenAPI file (json/yaml)")
	cmd.Flags().StringVarP(&outputFile, "output", "o", "", "Output Postman file")
	return cmd
}
