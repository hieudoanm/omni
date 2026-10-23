package pdf

import (
	"github.com/hieudoanm/omni/packages/cli/src/cmd/pdf/addnumbers"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/pdf/annotate"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/pdf/combine"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/pdf/convert"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/pdf/create"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/pdf/crop"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/pdf/delete"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/pdf/edit"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/pdf/extract"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/pdf/inspect"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/pdf/maintain"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/pdf/rearrange"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/pdf/security"
	"github.com/spf13/cobra"
)

func NewCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "pdf",
		Short: "PDF processing toolkit",
		Long:  "PDF processing toolkit with subcommands grouped by concern: combine, security, extract, edit, inspect, convert, and maintain.",
		RunE:  func(cmd *cobra.Command, args []string) error { return cmd.Help() },
	}

	cmd.AddCommand(combine.NewCommand())
	cmd.AddCommand(security.NewCommand())
	cmd.AddCommand(extract.NewCommand())
	cmd.AddCommand(edit.NewCommand())
	cmd.AddCommand(inspect.NewCommand())
	cmd.AddCommand(maintain.NewCommand())
	cmd.AddCommand(convert.NewCommand())
	cmd.AddCommand(crop.NewCommand())
	cmd.AddCommand(delete.NewCommand())
	cmd.AddCommand(rearrange.NewCommand())
	cmd.AddCommand(addnumbers.NewCommand())
	cmd.AddCommand(create.NewCommand())
	cmd.AddCommand(annotate.NewCommand())
	cmd.PersistentFlags().BoolP("json", "j", false, "Output in JSON format")
	return cmd
}
