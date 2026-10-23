package mcp

import (
	"bytes"
	"encoding/json"
)

const ProtocolVersion = "2025-11-25"

// MaxFrameBytes caps a single JSON-RPC frame. A larger frame is reported as a
// parse error instead of being buffered, so a client cannot grow the heap
// without bound. It matches the cap the other headless MCP servers use.
const MaxFrameBytes = 8 << 20

// SupportedProtocolVersions lists the MCP revisions this server can speak,
// newest first.
func SupportedProtocolVersions() []string {
	return []string{ProtocolVersion}
}

// ObjectOrEmpty returns params, treating an absent or JSON-null value as an
// empty object so a tools/call without params still names no tool instead of
// failing to decode.
func ObjectOrEmpty(params json.RawMessage) json.RawMessage {
	trimmed := bytes.TrimSpace(params)
	if len(trimmed) == 0 || string(trimmed) == "null" {
		return json.RawMessage(`{}`)
	}
	return params
}

type Request struct {
	JSONRPC string          `json:"jsonrpc"`
	ID      json.RawMessage `json:"id"`
	Method  string          `json:"method"`
	Params  json.RawMessage `json:"params,omitempty"`
}

type Response struct {
	JSONRPC string          `json:"jsonrpc"`
	ID      json.RawMessage `json:"id"`
	Result  any             `json:"result,omitempty"`
	Error   *ErrorObject    `json:"error,omitempty"`
}

type Notification struct {
	JSONRPC string          `json:"jsonrpc"`
	Method  string          `json:"method"`
	Params  json.RawMessage `json:"params,omitempty"`
}

type ErrorObject struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
}

type Tool struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	InputSchema Schema `json:"inputSchema"`
}

type Schema struct {
	Type       string                    `json:"type"`
	Properties map[string]PropertySchema `json:"properties"`
	Required   []string                  `json:"required,omitempty"`
}

type PropertySchema struct {
	Type        string          `json:"type"`
	Description string          `json:"description,omitempty"`
	Default     any             `json:"default,omitempty"`
	Enum        []string        `json:"enum,omitempty"`
	Items       *PropertySchema `json:"items,omitempty"`
}

type ToolResult struct {
	Content []ContentItem `json:"content"`
	IsError bool          `json:"isError,omitempty"`
}

type ContentItem struct {
	Type string `json:"type"`
	Text string `json:"text"`
}

type ToolCallParams struct {
	Name      string          `json:"name"`
	Arguments json.RawMessage `json:"arguments"`
}

type InitializeParams struct {
	ProtocolVersion string `json:"protocolVersion"`
	ClientInfo      struct {
		Name    string `json:"name"`
		Version string `json:"version"`
	} `json:"clientInfo"`
}

type InitializeResult struct {
	ProtocolVersion string             `json:"protocolVersion"`
	Capabilities    ServerCapabilities `json:"capabilities"`
	ServerInfo      ServerInfo         `json:"serverInfo"`
}

type ServerCapabilities struct {
	Tools     *ToolsCapabilities     `json:"tools,omitempty"`
	Resources *ResourcesCapabilities `json:"resources,omitempty"`
}

type ToolsCapabilities struct {
	ListChanged bool `json:"listChanged"`
}

type ResourcesCapabilities struct {
	ListChanged bool `json:"listChanged"`
}

type ServerInfo struct {
	Name    string `json:"name"`
	Version string `json:"version"`
}

type ListToolsResult struct {
	Tools      []Tool `json:"tools"`
	NextCursor string `json:"nextCursor,omitempty"`
}

const (
	ErrCodeParse          = -32700
	ErrCodeInvalidRequest = -32600
	ErrCodeMethodNotFound = -32601
	ErrCodeInvalidParams  = -32602
	ErrCodeInternal       = -32603
)

func NewErrorResponse(id json.RawMessage, code int, msg string) Response {
	return Response{
		JSONRPC: "2.0",
		ID:      id,
		Error: &ErrorObject{
			Code:    code,
			Message: msg,
		},
	}
}

func NewSuccessResponse(id json.RawMessage, result any) Response {
	return Response{
		JSONRPC: "2.0",
		ID:      id,
		Result:  result,
	}
}

func NewToolResultText(text string) *ToolResult {
	return &ToolResult{
		Content: []ContentItem{
			{Type: "text", Text: text},
		},
	}
}

func NewToolResultError(text string) *ToolResult {
	return &ToolResult{
		Content: []ContentItem{
			{Type: "text", Text: text},
		},
		IsError: true,
	}
}
