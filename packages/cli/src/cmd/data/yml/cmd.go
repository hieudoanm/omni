package yml

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var validate, lint, jsonOut bool

	cmd := &cobra.Command{
		Use:   "yml <file>",
		Short: "Parse, validate, and lint YAML files",
		Long:  `Parse, validate, lint, and convert YAML files. Can output as JSON or reformatted YAML.`,
		Example: `  data yml config.yml
  data yml config.yml --validate
  data yml config.yml --json`,
		Args: cobra.MaximumNArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			return runE(args, validate, lint, jsonOut)
		},
	}

	cmd.Flags().BoolVarP(&validate, "validate", "V", false, "Validate YAML syntax")
	cmd.Flags().BoolVar(&lint, "lint", false, "Lint YAML file")
	cmd.Flags().BoolVar(&jsonOut, "json", false, "Output in JSON format")
	return cmd
}
