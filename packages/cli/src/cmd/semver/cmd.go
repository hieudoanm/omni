package semver

import (
	"encoding/json"
	"fmt"

	"github.com/spf13/cobra"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/semver/compare"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/semver/sort"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/semver/validate"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/semver/version"
)

func NewCommand() *cobra.Command {
	var bumpPart, prerelease, rangeExpr, singleVersion string

	cmd := &cobra.Command{
		Use:   "semver <command> [flags]",
		Short: "Parse, compare, sort, and bump semver strings",
		Long:  `Tools for working with semantic version strings (major.minor.patch).`,
		Example: `  semver validate --versions 1.2.3
  semver compare --a 1.0.0 --b 2.0.0
  semver sort --versions 1.2.0,2.0.0,1.10.0
  semver --bump minor --version 1.2.3
  semver --bump patch --prerelease alpha --version 1.2.3
  semver --range ">=1.0.0 <2.0.0" --version 1.5.0`,
		RunE: func(cmd *cobra.Command, args []string) error {
			if bumpPart != "" {
				v, err := version.Parse(singleVersion)
				if err != nil {
					return err
				}
				result := v.Bump(bumpPart)
				if prerelease != "" {
					result.Prerelease = prerelease
				}
				if ok, _ := cmd.Flags().GetBool("json"); ok {
					out, err := json.MarshalIndent(map[string]interface{}{
						"input":      singleVersion,
						"result":     result.String(),
						"bump":       bumpPart,
						"prerelease": prerelease,
					}, "", "  ")
					if err != nil {
						return err
					}
					fmt.Println(string(out))
				} else {
					fmt.Println(result)
				}
				return nil
			}

			if rangeExpr != "" {
				if singleVersion == "" {
					return fmt.Errorf("need a version to check against range: use --version")
				}
				v, err := version.Parse(singleVersion)
				if err != nil {
					return err
				}
				matches, err := version.CheckRange(v, rangeExpr)
				if err != nil {
					return err
				}
				if ok, _ := cmd.Flags().GetBool("json"); ok {
					out, err := json.MarshalIndent(map[string]interface{}{
						"version": singleVersion,
						"range":   rangeExpr,
						"matches": matches,
					}, "", "  ")
					if err != nil {
						return err
					}
					fmt.Println(string(out))
				} else {
					if matches {
						fmt.Printf("%s matches range %s\n", v, rangeExpr)
					} else {
						fmt.Printf("%s does NOT match range %s\n", v, rangeExpr)
					}
				}
				return nil
			}

			return cmd.Help()
		},
	}

	cmd.Flags().StringVar(&bumpPart, "bump", "", "Bump version part: major, minor, patch")
	cmd.Flags().StringVar(&prerelease, "prerelease", "", "Set prerelease label after bump")
	cmd.Flags().StringVar(&rangeExpr, "range", "", "Check if version matches a range (e.g. '>=1.0.0 <2.0.0')")
	cmd.Flags().StringVar(&singleVersion, "version", "", "Single version for --bump or --range")
	cmd.PersistentFlags().BoolP("json", "j", false, "Output in JSON format")
	cmd.AddCommand(validate.NewCmd(), compare.NewCmd(), sort.NewCmd())
	return cmd
}
