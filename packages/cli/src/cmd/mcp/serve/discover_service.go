package serve

import (
	"encoding/json"

	"github.com/hieudoanm/omni/packages/cli/src/libs/mcp"
	"github.com/spf13/cobra"
)

type cmdInfo struct {
	cmd  *cobra.Command
	name string
}

func walkCommands(parent *cobra.Command, name string) []cmdInfo {
	var result []cmdInfo
	if hasAction(parent) {
		result = append(result, cmdInfo{cmd: parent, name: name})
	}
	for _, child := range parent.Commands() {
		childName := child.Name()
		if childName == "help" || childName == "completion" || childName == "mcp" {
			continue
		}
		fullName := name + "." + childName
		result = append(result, walkCommands(child, fullName)...)
	}
	return result
}

func hasAction(cmd *cobra.Command) bool {
	return cmd.RunE != nil || cmd.Run != nil
}

func registerTools(server *mcp.Server, rootCmd *cobra.Command) {
	for _, sub := range rootCmd.Commands() {
		n := sub.Name()
		if n == "mcp" || n == "help" || n == "completion" {
			continue
		}
		infos := walkCommands(sub, sub.Name())
		for _, info := range infos {
			cmd := info.cmd
			schema := buildSchema(cmd)

			desc := cmd.Short
			if cmd.Long != "" {
				desc = cmd.Long
			}
			if cmd.Use != "" {
				desc += "\n\nUsage: " + cmd.Use
			}

			server.AddTool(mcp.Tool{
				Name:        info.name,
				Description: desc,
				InputSchema: schema,
			}, func(cmd *cobra.Command) func(json.RawMessage) *mcp.ToolResult {
				return func(args json.RawMessage) *mcp.ToolResult {
					return executeTool(cmd, args)
				}
			}(cmd))
		}
	}
}
