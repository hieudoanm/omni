package uuid

import "github.com/spf13/cobra"

func NewCommand() *cobra.Command {
	var count int

	cmd := &cobra.Command{
		Use:   "uuid",
		Short: "Generate UUID v4 identifiers",
		Long:  `Generate random UUID v4 (RFC 4122) identifiers. Supports generating multiple UUIDs at once and JSON output.`,
		Example: `  crypto uuid
  crypto uuid --count 5
  crypto uuid --count 3 --json`,
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")
			_, err := runUUIDs(count, jsonOutput)
			return err
		},
	}

	cmd.Flags().IntVarP(&count, "count", "n", 1, "Number of UUIDs to generate")
	cmd.Flags().Bool("json", false, "Output in JSON format")
	return cmd
}
