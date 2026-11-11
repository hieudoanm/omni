package internal

import (
	"fmt"
	"strings"
)

type NodeKind string

const (
	NodeFile      NodeKind = "file"
	NodeFunction  NodeKind = "function"
	NodeMethod    NodeKind = "method"
	NodeType      NodeKind = "type"
	NodeInterface NodeKind = "interface"
	NodeClass     NodeKind = "class"
	NodeVariable  NodeKind = "variable"
	NodeConstant  NodeKind = "constant"
)

type EdgeKind string

const (
	EdgeContains EdgeKind = "contains"
	EdgeCalls    EdgeKind = "calls"
)

type Node struct {
	ID       string
	Kind     NodeKind
	Label    string
	File     string
	Line     int
	Lang     string
	Exported bool
}

type Edge struct {
	ID     string
	Source string
	Target string
	Kind   EdgeKind
	Line   int
}

type Graph struct {
	Nodes       []*Node
	Edges       []*Edge
	nodeByID    map[string]*Node
	symbolIndex map[string][]string
	edgeCounter int
}

func NewGraph() *Graph {
	return &Graph{
		nodeByID:    make(map[string]*Node),
		symbolIndex: make(map[string][]string),
	}
}

func (g *Graph) AddFile(info *FileInfo) {
	fileID := sanitizeID("file:" + info.File.RelPath)
	fileNode := &Node{
		ID:    fileID,
		Kind:  NodeFile,
		Label: info.File.RelPath,
		File:  info.File.RelPath,
		Lang:  string(info.File.Lang),
	}
	g.addNode(fileNode)

	for _, sym := range info.Symbols {
		symID := sanitizeID(fmt.Sprintf("sym:%s:%s:%d", info.File.RelPath, sym.Name, sym.Line))
		symNode := &Node{
			ID:       symID,
			Kind:     symbolKind(sym.Kind),
			Label:    sym.Name,
			File:     info.File.RelPath,
			Line:     sym.Line,
			Lang:     string(info.File.Lang),
			Exported: sym.Exported,
		}
		g.addNode(symNode)
		g.symbolIndex[sym.Name] = append(g.symbolIndex[sym.Name], symID)
		g.addEdge(&Edge{
			ID:     g.nextEdgeID(),
			Source: fileID,
			Target: symID,
			Kind:   EdgeContains,
			Line:   sym.Line,
		})
	}

	for _, call := range info.Calls {
		callerID := g.findSymbolInFile(call.CallerName, info.File.RelPath)
		if callerID == "" {
			continue
		}
		g.Edges = append(g.Edges, &Edge{
			ID:     g.nextEdgeID(),
			Source: callerID,
			Target: "UNRESOLVED:" + call.CalleeName,
			Kind:   EdgeCalls,
			Line:   call.Line,
		})
	}
}

func (g *Graph) ResolveCallEdges() {
	resolved := make([]*Edge, 0, len(g.Edges))

	for _, e := range g.Edges {
		if !strings.HasPrefix(e.Target, "UNRESOLVED:") {
			resolved = append(resolved, e)
			continue
		}

		calleeName := strings.TrimPrefix(e.Target, "UNRESOLVED:")
		targets, ok := g.symbolIndex[calleeName]
		if !ok {
			continue
		}

		for i, t := range targets {
			edgeID := e.ID
			if i > 0 {
				edgeID = g.nextEdgeID()
			}
			resolved = append(resolved, &Edge{
				ID:     edgeID,
				Source: e.Source,
				Target: t,
				Kind:   EdgeCalls,
				Line:   e.Line,
			})
		}
	}

	g.Edges = resolved
}

func (g *Graph) NodeCount() int { return len(g.Nodes) }

func (g *Graph) EdgeCount() int { return len(g.Edges) }

func (g *Graph) addNode(n *Node) {
	if _, exists := g.nodeByID[n.ID]; !exists {
		g.Nodes = append(g.Nodes, n)
		g.nodeByID[n.ID] = n
	}
}

func (g *Graph) addEdge(e *Edge) {
	g.Edges = append(g.Edges, e)
}

func (g *Graph) nextEdgeID() string {
	g.edgeCounter++
	return fmt.Sprintf("e%d", g.edgeCounter)
}

func (g *Graph) findSymbolInFile(name, relPath string) string {
	candidates := g.symbolIndex[name]
	for _, id := range candidates {
		if n, ok := g.nodeByID[id]; ok && n.File == relPath {
			return id
		}
	}
	return ""
}

func symbolKind(k SymbolKind) NodeKind {
	switch k {
	case KindFunction:
		return NodeFunction
	case KindMethod:
		return NodeMethod
	case KindType:
		return NodeType
	case KindInterface:
		return NodeInterface
	case KindClass:
		return NodeClass
	case KindVariable:
		return NodeVariable
	case KindConstant:
		return NodeConstant
	default:
		return NodeFunction
	}
}

func sanitizeID(s string) string {
	r := strings.NewReplacer(
		"/", "_",
		"\\", "_",
		".", "_",
		" ", "_",
		":", "_",
		"-", "_",
	)
	return r.Replace(s)
}
