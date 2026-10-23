package doi

import (
	"github.com/hieudoanm/omni/packages/cli/src/cmd/doi/cite"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/doi/fetch"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/doi/ref"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/doi/validate"
	"github.com/spf13/cobra"
)

func NewCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "doi",
		Short: "DOI productivity tools",
		Long:  `Tools for working with Digital Object Identifiers (DOIs): fetch metadata, generate citations, and validate identifiers.`,
		Example: `  doi fetch 10.1000/xyz123
  doi cite 10.1000/xyz123
  doi ref 10.1000/xyz123
  doi validate 10.1000/xyz123`,
		RunE: func(cmd *cobra.Command, args []string) error { return cmd.Help() },
	}

	cmd.AddCommand(cite.NewCmd())
	cmd.AddCommand(ref.NewCmd())
	cmd.AddCommand(fetch.NewCmd())
	cmd.AddCommand(validate.NewCmd())
	cmd.PersistentFlags().BoolP("json", "j", false, "Output in JSON format")
	return cmd
}
