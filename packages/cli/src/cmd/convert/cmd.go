package convert

import (
	"github.com/hieudoanm/omni/packages/cli/src/cmd/convert/base64"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/convert/braille"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/convert/camelcase"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/convert/capitalise"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/convert/count"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/convert/deburr"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/convert/kebabcase"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/convert/lorem"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/convert/lowercase"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/convert/morse"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/convert/pascalcase"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/convert/slug"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/convert/snakecase"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/convert/uppercase"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/convert/url"
	"github.com/spf13/cobra"
)

func NewCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "convert",
		Short: "Text conversion utilities",
		Long:  `Convert text between formats: Braille, Morse code, and string case transformations.`,
		Example: `  convert base64 "hello world"
  convert morse "sos"
  convert slug "Hello World!"`,
		RunE: func(cmd *cobra.Command, args []string) error { return cmd.Help() },
	}

	cmd.AddCommand(braille.NewCommand())
	cmd.AddCommand(morse.NewCommand())
	cmd.AddCommand(base64.NewCommand())
	cmd.AddCommand(url.NewCommand())
	cmd.AddCommand(capitalise.NewCommand())
	cmd.AddCommand(deburr.NewCommand())
	cmd.AddCommand(kebabcase.NewCommand())
	cmd.AddCommand(lorem.NewCommand())
	cmd.AddCommand(camelcase.NewCommand())
	cmd.AddCommand(pascalcase.NewCommand())
	cmd.AddCommand(slug.NewCommand())
	cmd.AddCommand(lowercase.NewCommand())
	cmd.AddCommand(snakecase.NewCommand())
	cmd.AddCommand(uppercase.NewCommand())
	cmd.AddCommand(count.NewCommand())
	cmd.PersistentFlags().BoolP("json", "j", false, "Output in JSON format")
	return cmd
}
