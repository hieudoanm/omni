package theme

import (
	"charm.land/lipgloss/v2"
)

var (
	Title   = lipgloss.NewStyle().Foreground(lipgloss.Color("#c9a84c")).Bold(true)
	Muted   = lipgloss.NewStyle().Foreground(lipgloss.Color("#6b5a3e"))
	Success = lipgloss.NewStyle().Foreground(lipgloss.Color("#81c784"))
	Warning = lipgloss.NewStyle().Foreground(lipgloss.Color("#ffb74d"))
	Error   = lipgloss.NewStyle().Foreground(lipgloss.Color("#e57373"))
	Gold    = lipgloss.NewStyle().Foreground(lipgloss.Color("#c9a84c"))
	RAM     = lipgloss.NewStyle().Foreground(lipgloss.Color("#34d399"))

	Card = lipgloss.NewStyle().
		Border(lipgloss.RoundedBorder()).
		BorderForeground(lipgloss.Color("#2a1f0e")).
		Padding(0, 1)

	Box = lipgloss.NewStyle().
		Border(lipgloss.RoundedBorder()).
		Padding(0, 1).
		BorderForeground(lipgloss.Color("62"))

	Header = lipgloss.NewStyle().
		Bold(true).
		Foreground(lipgloss.Color("205")).
		Padding(0, 1)

	Footer = lipgloss.NewStyle().
		Foreground(lipgloss.Color("241")).
		Padding(0, 1)

	Row = lipgloss.NewStyle().Padding(0, 1)

	SelectedRow = lipgloss.NewStyle().
			Padding(0, 1).
			Background(lipgloss.Color("62")).
			Foreground(lipgloss.Color("230")).
			Bold(true)

	History = lipgloss.NewStyle().
		Border(lipgloss.RoundedBorder()).
		Padding(1, 1).
		Width(82)

	Input = lipgloss.NewStyle().
		Border(lipgloss.RoundedBorder()).
		Padding(0, 1).
		Width(82)

	GreenDot  = lipgloss.NewStyle().Foreground(lipgloss.Color("42")).Render("●")
	RedDot    = lipgloss.NewStyle().Foreground(lipgloss.Color("196")).Render("●")
	YellowDot = lipgloss.NewStyle().Foreground(lipgloss.Color("226")).Render("●")

	TitlePomodoro = lipgloss.NewStyle().Bold(true).MarginBottom(1)
	TimePomodoro  = lipgloss.NewStyle().Foreground(lipgloss.Color("205")).Bold(true)

	TaxTitle  = lipgloss.NewStyle().Bold(true).Foreground(lipgloss.Color("212"))
	TaxActive = lipgloss.NewStyle().Foreground(lipgloss.Color("42"))
	TaxDim    = lipgloss.NewStyle().Foreground(lipgloss.Color("240"))

	// New theme styles for expanded commands
	Label     = lipgloss.NewStyle().Bold(true).Foreground(lipgloss.Color("215"))
	Value     = lipgloss.NewStyle().Foreground(lipgloss.Color("188"))
	Section   = lipgloss.NewStyle().Bold(true).Foreground(lipgloss.Color("205")).MarginTop(1)
	Divider   = lipgloss.NewStyle().Foreground(lipgloss.Color("240"))
	Dim       = lipgloss.NewStyle().Foreground(lipgloss.Color("241"))
	Highlight = lipgloss.NewStyle().Bold(true).Foreground(lipgloss.Color("220"))

	CopyIcon    = lipgloss.NewStyle().Foreground(lipgloss.Color("33")).Render("📋")
	LockIcon    = lipgloss.NewStyle().Foreground(lipgloss.Color("42")).Render("🔒")
	GlobeIcon   = lipgloss.NewStyle().Foreground(lipgloss.Color("99")).Render("🌐")
	KeyIcon     = lipgloss.NewStyle().Foreground(lipgloss.Color("220")).Render("🔑")
	WarningIcon = lipgloss.NewStyle().Foreground(lipgloss.Color("226")).Render("⚠")
	CheckIcon   = lipgloss.NewStyle().Foreground(lipgloss.Color("42")).Render("✓")
	CrossIcon   = lipgloss.NewStyle().Foreground(lipgloss.Color("196")).Render("✗")

	ServerUp   = lipgloss.NewStyle().Foreground(lipgloss.Color("42")).Render("●")
	ServerDown = lipgloss.NewStyle().Foreground(lipgloss.Color("196")).Render("●")
	ServerWarn = lipgloss.NewStyle().Foreground(lipgloss.Color("226")).Render("●")
)

func StatusStyle(v float64) lipgloss.Style {
	if v > 85 {
		return Error
	}
	if v > 65 {
		return Warning
	}
	return Success
}

func DotForStatus(status string) string {
	switch status {
	case "up", "ok", "healthy":
		return ServerUp
	case "down", "error", "critical":
		return ServerDown
	default:
		return ServerWarn
	}
}
