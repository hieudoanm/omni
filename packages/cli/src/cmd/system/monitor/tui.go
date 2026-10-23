package monitor

import (
	"fmt"
	"time"

	tea "charm.land/bubbletea/v2"

	"github.com/hieudoanm/omni/packages/cli/src/libs/theme"
)

type tickMsg time.Time
type metricsMsg Metrics

type model struct {
	metrics    Metrics
	cpuHistory []float64
	ramHistory []float64
	width      int
	err        error
}

func (m model) Init() tea.Cmd {
	return tea.Batch(fetchMetrics(), tickEvery())
}

func fetchMetrics() tea.Cmd {
	return func() tea.Msg {
		m, err := GatherMetrics()
		if err != nil {
			return err
		}
		return metricsMsg(m)
	}
}

func tickEvery() tea.Cmd {
	return tea.Tick(time.Second, func(t time.Time) tea.Msg {
		return tickMsg(t)
	})
}

func (m model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {

	case tea.KeyMsg:
		if msg.String() == "q" || msg.String() == "ctrl+c" {
			return m, tea.Quit
		}

	case tea.WindowSizeMsg:
		m.width = msg.Width

	case metricsMsg:
		m.metrics = Metrics(msg)
		m.cpuHistory = append(m.cpuHistory, m.metrics.CPUTotal)
		m.ramHistory = append(m.ramHistory, m.metrics.RAMPct)

	case tickMsg:
		return m, tea.Batch(fetchMetrics(), tickEvery())

	case error:
		m.err = msg
	}

	return m, nil
}

func (m model) View() tea.View {
	if m.err != nil {
		return tea.NewView(theme.Error.Render("error: " + m.err.Error()))
	}

	uptime := time.Duration(m.metrics.Uptime) * time.Second

	content := fmt.Sprintf(
		"%s\nCPU: %.1f%%\nRAM: %.1f%%\nUptime: %s\n\nPress q to quit",
		theme.Title.Render("SYSTEM MONITOR"),
		m.metrics.CPUTotal,
		m.metrics.RAMPct,
		uptime.Truncate(time.Second),
	)

	return tea.NewView(content)
}
