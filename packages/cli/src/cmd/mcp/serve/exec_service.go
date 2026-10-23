package serve

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/hieudoanm/omni/packages/cli/src/libs/history"
	"github.com/hieudoanm/omni/packages/cli/src/libs/mcp"
	"github.com/spf13/cobra"
	"github.com/spf13/pflag"
)

var captureMu sync.Mutex

func getCWD() string {
	d, err := os.Getwd()
	if err != nil {
		return ""
	}
	return d
}

func executeTool(cmd *cobra.Command, rawArgs json.RawMessage) *mcp.ToolResult {
	start := time.Now()
	toolName := strings.TrimPrefix(cmd.CommandPath(), "omni ")

	var argsMap map[string]any
	if err := json.Unmarshal(rawArgs, &argsMap); err != nil {
		return mcp.NewToolResultError("invalid arguments: " + err.Error())
	}

	resetFlags(cmd)

	var posArgs []string

	for name, value := range argsMap {
		if name == "_args" {
			if list, ok := value.([]any); ok {
				for _, a := range list {
					posArgs = append(posArgs, fmt.Sprintf("%v", a))
				}
			}
			continue
		}

		flag := cmd.Flag(name)
		if flag == nil {
			continue
		}

		setFlagValue(flag, value)
	}

	stdout, stderr, err := captureRun(cmd, posArgs)

	var resultText string
	if stdout != "" {
		resultText = stdout
	}
	if stderr != "" && err != nil {
		if resultText != "" {
			resultText += "\n"
		}
		resultText += stderr
	}

	entry := history.Entry{
		Timestamp:  start.Format(time.RFC3339),
		Source:     "mcp",
		Command:    toolName,
		CWD:        getCWD(),
		DurationMs: time.Since(start).Milliseconds(),
	}

	if err != nil {
		if resultText == "" {
			resultText = err.Error()
		}
		entry.Error = err.Error()
		history.Append(entry)
		return mcp.NewToolResultError(strings.TrimSpace(resultText))
	}

	history.Append(entry)
	return mcp.NewToolResultText(strings.TrimSpace(resultText))
}

func resetFlags(cmd *cobra.Command) {
	cmd.LocalFlags().VisitAll(func(f *pflag.Flag) {
		f.Value.Set(f.DefValue)
	})
	cmd.InheritedFlags().VisitAll(func(f *pflag.Flag) {
		f.Value.Set(f.DefValue)
	})
}

func setFlagValue(flag *pflag.Flag, value any) {
	switch val := value.(type) {
	case bool:
		flag.Value.Set(fmt.Sprintf("%t", val))
	case float64:
		if flag.Value.Type() == "int" || flag.Value.Type() == "int64" {
			flag.Value.Set(fmt.Sprintf("%d", int(val)))
		} else {
			flag.Value.Set(fmt.Sprintf("%v", val))
		}
	case string:
		flag.Value.Set(val)
	case []any:
		for _, v := range val {
			flag.Value.Set(fmt.Sprintf("%v", v))
		}
	default:
		flag.Value.Set(fmt.Sprintf("%v", value))
	}
}

func captureRun(cmd *cobra.Command, posArgs []string) (string, string, error) {
	captureMu.Lock()
	defer captureMu.Unlock()

	oldStdout := os.Stdout
	stdoutR, stdoutW, _ := os.Pipe()
	os.Stdout = stdoutW

	oldStderr := os.Stderr
	stderrR, stderrW, _ := os.Pipe()
	os.Stderr = stderrW

	// Drain both pipes while the command runs. Reading only after RunE returns
	// deadlocks as soon as a tool writes more than the pipe buffer, which hangs
	// the whole MCP server on a large result.
	var wg sync.WaitGroup
	var stdoutRaw, stderrRaw []byte
	wg.Add(2)
	go func() {
		defer wg.Done()
		stdoutRaw, _ = io.ReadAll(stdoutR)
	}()
	go func() {
		defer wg.Done()
		stderrRaw, _ = io.ReadAll(stderrR)
	}()

	var cmdBuf bytes.Buffer
	cmd.SetOut(&cmdBuf)
	cmd.SetErr(&cmdBuf)

	err := cmd.RunE(cmd, posArgs)

	stdoutW.Close()
	stderrW.Close()
	wg.Wait()
	os.Stdout = oldStdout
	os.Stderr = oldStderr

	stdout := string(stdoutRaw) + cmdBuf.String()
	stderr := string(stderrRaw)

	return stdout, stderr, err
}
