package jwt

import (
	"github.com/hieudoanm/omni/packages/cli/src/cmd/crypto/jwt/decode"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/crypto/jwt/encode"
	"github.com/spf13/cobra"
)

func NewCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "jwt",
		Short: "Encode and decode JWTs",
		Long:  `Encode (sign) and decode JWT tokens using HMAC-based algorithms (HS256, HS384, HS512).`,
		Example: `  crypto jwt encode --key secret --claims '{"sub":"123","name":"John"}'
  crypto jwt decode --token eyJhbGci...`,
		RunE: func(cmd *cobra.Command, args []string) error { return cmd.Help() },
	}

	cmd.AddCommand(encode.NewCmd(), decode.NewCmd())
	return cmd
}
