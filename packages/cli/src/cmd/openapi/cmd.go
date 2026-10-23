package openapi

import (
	"github.com/hieudoanm/omni/packages/cli/src/cmd/openapi/postman"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/openapi/validate"
	"github.com/spf13/cobra"
)

func NewCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "openapi",
		Short: "OpenAPI related tools",
		Long:  `Tools for interacting with and managing OpenAPI specifications.`,
		Example: `  openapi validate -f spec.yaml
  openapi openapi2postman -i spec.yaml`,
		RunE: func(cmd *cobra.Command, args []string) error { return cmd.Help() },
	}

	cmd.AddCommand(postman.NewCommand())
	cmd.AddCommand(validate.NewCommand())
	cmd.PersistentFlags().BoolP("json", "j", false, "Output in JSON format")
	return cmd
}
