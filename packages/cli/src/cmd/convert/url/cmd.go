package url

import (
	"github.com/spf13/cobra"
)

func NewCommand() *cobra.Command {
	var decode bool

	cmd := &cobra.Command{
		Use:   "url [text]",
		Short: "Encode or decode a URL",
		Long:  `URL-encode a string or URL-decode an encoded string (use --decode for decoding).`,
		Example: `  convert url "hello world"
  convert url --decode "hello+world"`,
		Args: cobra.MaximumNArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			return Run(cmd, args, decode)
		},
	}

	cmd.Flags().BoolVarP(&decode, "decode", "d", false, "Decode URL")
	return cmd
}
