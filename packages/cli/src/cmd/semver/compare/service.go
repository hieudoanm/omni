package compare

import (
	"encoding/json"
	"fmt"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/semver/version"
)

func runCompare(aStr, bStr string, jsonOutput bool) error {
	if aStr == "" || bStr == "" {
		return fmt.Errorf("need both --a and --b versions")
	}
	a, err := version.Parse(aStr)
	if err != nil {
		return err
	}
	b, err := version.Parse(bStr)
	if err != nil {
		return err
	}
	cmp := a.Compare(b)
	var rel string
	switch {
	case cmp < 0:
		rel = "<"
	case cmp > 0:
		rel = ">"
	default:
		rel = "=="
	}
	if jsonOutput {
		out, err := json.MarshalIndent(map[string]interface{}{
			"a":        a.String(),
			"b":        b.String(),
			"relation": rel,
		}, "", "  ")
		if err != nil {
			return err
		}
		fmt.Println(string(out))
	} else {
		fmt.Printf("%s %s %s\n", a, rel, b)
	}
	return nil
}
