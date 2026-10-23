package serve

import (
	"fmt"
	"strings"

	"github.com/hieudoanm/omni/packages/cli/src/libs/mcp"
	"github.com/spf13/cobra"
	"github.com/spf13/pflag"
)

func buildSchema(cmd *cobra.Command) mcp.Schema {
	props := make(map[string]mcp.PropertySchema)

	cmd.LocalFlags().VisitAll(func(f *pflag.Flag) {
		if f.Name == "help" {
			return
		}
		ps := mcp.PropertySchema{
			Description: f.Usage,
		}
		switch f.Value.Type() {
		case "bool":
			ps.Type = "boolean"
		case "int", "int64", "uint", "uint64":
			ps.Type = "integer"
		case "float64", "float32":
			ps.Type = "number"
		case "string":
			ps.Type = "string"
		case "stringSlice", "intSlice":
			ps.Type = "array"
			ps.Items = &mcp.PropertySchema{Type: "string"}
		case "duration":
			ps.Type = "string"
		default:
			ps.Type = "string"
		}

		if f.DefValue != "" && f.DefValue != "false" && f.DefValue != "0" {
			switch f.Value.Type() {
			case "int", "int64", "float64":
				if f.DefValue != "0" {
					ps.Default = f.DefValue
				}
			case "string":
				if f.DefValue != "" {
					ps.Default = f.DefValue
				}
			}
		}

		props[f.Name] = ps
	})

	if takesArgs(cmd) || len(props) == 0 {
		props["_args"] = mcp.PropertySchema{
			Type:        "array",
			Description: "Positional command-line arguments",
			Items:       &mcp.PropertySchema{Type: "string"},
		}
	}

	return mcp.Schema{
		Type:       "object",
		Properties: props,
	}
}

func takesArgs(cmd *cobra.Command) bool {
	if cmd.Args == nil {
		return true
	}
	s := fmt.Sprintf("%T", cmd.Args)
	return !strings.Contains(s, "NoArgs") && !strings.Contains(s, "nil")
}
