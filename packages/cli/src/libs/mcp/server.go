package mcp

import (
	"bufio"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"os"
	"strings"
)

type ToolHandler func(args json.RawMessage) *ToolResult

type Server struct {
	tools    map[string]Tool
	handlers map[string]ToolHandler
}

func NewServer() *Server {
	return &Server{
		tools:    make(map[string]Tool),
		handlers: make(map[string]ToolHandler),
	}
}

func (s *Server) AddTool(tool Tool, handler ToolHandler) {
	s.tools[tool.Name] = tool
	s.handlers[tool.Name] = handler
}

func (s *Server) Run() error {
	return s.runWithReader(context.Background(), os.Stdin)
}

func (s *Server) RunWithContext(ctx context.Context) error {
	return s.runWithReader(ctx, os.Stdin)
}

func (s *Server) runWithReader(ctx context.Context, stdin io.Reader) error {
	log.SetOutput(os.Stderr)
	log.SetPrefix("[mcp] ")

	reader := bufio.NewReader(stdin)
	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		default:
		}

		// A read can block indefinitely, so it runs on its own goroutine to keep
		// the loop cancellable. Its outcome is one of exactly two values, so a
		// single struct channel replaces the two channels this used to need.
		type readResult struct {
			frame   string
			tooLong bool
			err     error
		}
		resultCh := make(chan readResult, 1)

		go func() {
			frame, tooLong, err := readFrame(reader)
			resultCh <- readResult{frame: frame, tooLong: tooLong, err: err}
		}()

		select {
		case res := <-resultCh:
			if res.tooLong {
				s.write(NewErrorResponse(nil, ErrCodeParse, "parse error: frame too large"))
				continue
			}
			if res.err != nil {
				if errors.Is(res.err, io.EOF) {
					return nil
				}
				return fmt.Errorf("read stdin: %w", res.err)
			}
			frame := strings.TrimSpace(res.frame)
			if frame == "" {
				continue
			}
			s.handleMessage([]byte(frame))
		case <-ctx.Done():
			return ctx.Err()
		}
	}
}

// readFrame reads one newline-terminated frame, refusing anything larger than
// MaxFrameBytes so a hostile or broken client cannot grow the heap without
// bound. An over-long frame leaves the reader on its remaining bytes, so the
// tail is discarded as junk and the stream resynchronises on the next newline.
func readFrame(reader *bufio.Reader) (string, bool, error) {
	var frame strings.Builder
	for {
		chunk, err := reader.ReadSlice('\n')
		if frame.Len()+len(chunk) > MaxFrameBytes {
			return "", true, nil
		}
		frame.Write(chunk)
		if err == nil {
			return frame.String(), false, nil
		}
		if errors.Is(err, bufio.ErrBufferFull) {
			continue
		}
		return frame.String(), false, err
	}
}

func (s *Server) handleMessage(raw []byte) {
	var msg struct {
		ID      json.RawMessage `json:"id"`
		Method  string          `json:"method"`
		Params  json.RawMessage `json:"params,omitempty"`
		JSONRPC string          `json:"jsonrpc"`
	}
	if err := json.Unmarshal(raw, &msg); err != nil {
		s.write(NewErrorResponse(nil, ErrCodeParse, "parse error: "+err.Error()))
		return
	}

	// A notification carries no id, so it must never be answered. Answering one
	// desynchronises the client, so this check precedes the jsonrpc version
	// check and covers every method, not just unknown ones.
	isNotification := msg.ID == nil || len(msg.ID) == 0 || string(msg.ID) == "null"
	if isNotification {
		log.Printf("ignoring notification for method %s", msg.Method)
		return
	}

	if msg.JSONRPC != "2.0" {
		s.write(NewErrorResponse(msg.ID, ErrCodeInvalidRequest, "invalid jsonrpc version"))
		return
	}

	switch msg.Method {
	case "initialize":
		s.handleInitialize(msg.ID, msg.Params)
	case "ping":
		s.write(NewSuccessResponse(msg.ID, map[string]any{}))
	case "tools/list":
		s.handleListTools(msg.ID, msg.Params)
	case "tools/call":
		s.handleCallTool(msg.ID, msg.Params)
	default:
		s.write(NewErrorResponse(msg.ID, ErrCodeMethodNotFound, "method not found: "+msg.Method))
	}
}

func (s *Server) handleInitialize(id json.RawMessage, params json.RawMessage) {
	// A revision this server speaks is echoed back; anything else falls back to
	// ProtocolVersion and the client disconnects if it cannot speak that.
	version := ProtocolVersion
	var initParams InitializeParams
	if err := json.Unmarshal(ObjectOrEmpty(params), &initParams); err == nil {
		for _, supported := range SupportedProtocolVersions() {
			if initParams.ProtocolVersion == supported {
				version = supported
				break
			}
		}
	}

	result := InitializeResult{
		ProtocolVersion: version,
		Capabilities: ServerCapabilities{
			Tools: &ToolsCapabilities{ListChanged: false},
		},
		ServerInfo: ServerInfo{
			Name:    "omni-mcp",
			Version: "1.0.0",
		},
	}

	s.write(NewSuccessResponse(id, result))
}

func (s *Server) handleListTools(id json.RawMessage, _ json.RawMessage) {
	tools := make([]Tool, 0, len(s.tools))
	for _, t := range s.tools {
		tools = append(tools, t)
	}

	s.write(NewSuccessResponse(id, ListToolsResult{Tools: tools}))
}

func (s *Server) handleCallTool(id json.RawMessage, params json.RawMessage) {
	// Absent or null params are an empty object, so a call with no params names
	// no tool rather than failing to decode.
	var callParams ToolCallParams
	if err := json.Unmarshal(ObjectOrEmpty(params), &callParams); err != nil {
		s.write(NewErrorResponse(id, ErrCodeInvalidParams, "invalid params: "+err.Error()))
		return
	}

	handler, ok := s.handlers[callParams.Name]
	if !ok {
		s.write(NewErrorResponse(id, ErrCodeMethodNotFound, "tool not found: "+callParams.Name))
		return
	}

	result := handler(callParams.Arguments)
	s.write(NewSuccessResponse(id, result))
}

func (s *Server) write(resp Response) {
	data, err := json.Marshal(resp)
	if err != nil {
		log.Printf("error marshaling response: %v", err)
		return
	}
	fmt.Fprintln(os.Stdout, string(data))
}
