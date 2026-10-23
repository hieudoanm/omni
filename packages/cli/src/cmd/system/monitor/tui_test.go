package monitor

import (
	"strings"
	"testing"
	"time"

	tea "charm.land/bubbletea/v2"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/system/testutil"
)

func TestModel_InitReturnsCmds(t *testing.T) {
	m := model{}
	cmds := m.Init()
	if cmds == nil {
		t.Error("Init() should return commands")
	}
}

func TestModel_UpdateKeyQuit(t *testing.T) {
	m := model{}
	msg := tea.KeyPressMsg{Code: 'q'}
	_, cmd := m.Update(msg)
	if cmd == nil {
		t.Error("expected quit command on 'q' key")
	}
}

func TestModel_UpdateCtrlC(t *testing.T) {
	m := model{}
	msg := tea.KeyPressMsg{Code: 'c', Mod: tea.ModCtrl}
	_, cmd := m.Update(msg)
	if cmd == nil {
		t.Error("expected quit command on ctrl+c")
	}
}

func TestModel_UpdateKeyIgnored(t *testing.T) {
	m := model{}
	msg := tea.KeyPressMsg{Code: 'a'}
	_, cmd := m.Update(msg)
	if cmd != nil {
		t.Error("expected nil command for non-quit key")
	}
}

func TestModel_UpdateWindowSize(t *testing.T) {
	m := model{}
	msg := tea.WindowSizeMsg{Width: 120, Height: 40}
	updated, _ := m.Update(msg)
	m2 := updated.(model)
	if m2.width != 120 {
		t.Errorf("expected width 120, got %d", m2.width)
	}
}

func TestModel_UpdateMetrics(t *testing.T) {
	m := model{}
	metrics := Metrics{CPUTotal: 45.2, RAMPct: 60.0}
	msg := metricsMsg(metrics)
	updated, _ := m.Update(msg)
	m2 := updated.(model)
	if m2.metrics.CPUTotal != 45.2 {
		t.Errorf("expected CPUTotal 45.2, got %f", m2.metrics.CPUTotal)
	}
	if len(m2.cpuHistory) != 1 || m2.cpuHistory[0] != 45.2 {
		t.Errorf("cpuHistory should contain 45.2, got %v", m2.cpuHistory)
	}
	if len(m2.ramHistory) != 1 || m2.ramHistory[0] != 60.0 {
		t.Errorf("ramHistory should contain 60.0, got %v", m2.ramHistory)
	}
}

func TestModel_UpdateTick(t *testing.T) {
	m := model{}
	msg := tickMsg(time.Now())
	_, cmd := m.Update(msg)
	if cmd == nil {
		t.Error("expected command on tick")
	}
}

func TestModel_UpdateError(t *testing.T) {
	m := model{}
	msg := testutil.TestError("something went wrong")
	updated, _ := m.Update(msg)
	m2 := updated.(model)
	if m2.err == nil || m2.err.Error() != "something went wrong" {
		t.Errorf("expected error 'something went wrong', got %v", m2.err)
	}
}

func TestModel_ViewShowsMetrics(t *testing.T) {
	m := model{
		metrics: Metrics{CPUTotal: 35.7, RAMPct: 72.3, Uptime: 3600},
		width:   100,
	}
	v := m.View()
	c := v.Content
	if !strings.Contains(c, "35.7%") {
		t.Errorf("expected CPU 35.7%% in view, got %q", c)
	}
	if !strings.Contains(c, "72.3%") {
		t.Errorf("expected RAM 72.3%% in view, got %q", c)
	}
	if !strings.Contains(c, "SYSTEM MONITOR") {
		t.Errorf("expected title in view, got %q", c)
	}
	if !strings.Contains(c, "Press q to quit") {
		t.Errorf("expected quit hint in view, got %q", c)
	}
}

func TestModel_ViewShowsError(t *testing.T) {
	m := model{err: testutil.TestError("permission denied")}
	v := m.View()
	c := v.Content
	if !strings.Contains(c, "error: permission denied") {
		t.Errorf("expected error in view, got %q", c)
	}
}

func TestModel_ViewShowsZeroState(t *testing.T) {
	m := model{width: 100}
	v := m.View()
	if v.Content == "" {
		t.Error("view should not be empty with zero metrics")
	}
}

func TestModel_ViewHandlesZeroUptime(t *testing.T) {
	m := model{width: 80}
	v := m.View()
	if v.Content == "" {
		t.Error("view should handle zero uptime")
	}
}

func TestFetchMetrics_ReturnsCmd(t *testing.T) {
	cmd := fetchMetrics()
	if cmd == nil {
		t.Fatal("fetchMetrics returned nil")
	}
}

func TestTickEvery_ReturnsCmd(t *testing.T) {
	cmd := tickEvery()
	if cmd == nil {
		t.Fatal("tickEvery returned nil")
	}
}
