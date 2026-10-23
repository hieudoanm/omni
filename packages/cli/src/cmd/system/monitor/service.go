package monitor

import (
	"encoding/json"
	"fmt"
	"math"
	"sort"
	"strings"
	"time"

	"github.com/shirou/gopsutil/v4/cpu"
	"github.com/shirou/gopsutil/v4/disk"
	"github.com/shirou/gopsutil/v4/host"
	"github.com/shirou/gopsutil/v4/mem"
	"github.com/shirou/gopsutil/v4/net"
	"github.com/shirou/gopsutil/v4/process"

	"github.com/hieudoanm/omni/packages/cli/src/libs/theme"
)

var jsonOutput bool

const sparkChars = "▁▂▃▄▅▆▇█"

type ProcessInfo struct {
	PID   int32
	Name  string
	CPU   float64
	MemMB uint64
}

type Metrics struct {
	CPUTotal    float64
	CPUPerCore  []float64
	RAMUsedGB   float64
	RAMTotalGB  float64
	RAMPct      float64
	DiskReadKB  uint64
	DiskWriteKB uint64
	NetRxKB     uint64
	NetTxKB     uint64
	Uptime      uint64
	TopProcs    []ProcessInfo
}

var (
	cpuPercent     = cpu.Percent
	memVirtual     = mem.VirtualMemory
	diskIOCounters = disk.IOCounters
	netIOCounters  = net.IOCounters
	hostUptime     = host.Uptime
	processes      = process.Processes
)

func GatherMetrics() (Metrics, error) {
	var m Metrics

	if p, _ := cpuPercent(0, false); len(p) > 0 {
		m.CPUTotal = p[0]
	}
	m.CPUPerCore, _ = cpuPercent(0, true)

	if vm, err := memVirtual(); err == nil {
		m.RAMUsedGB = float64(vm.Used) / 1e9
		m.RAMTotalGB = float64(vm.Total) / 1e9
		m.RAMPct = vm.UsedPercent
	}

	if ioMap, err := diskIOCounters(); err == nil {
		for _, d := range ioMap {
			m.DiskReadKB += d.ReadBytes / 1024
			m.DiskWriteKB += d.WriteBytes / 1024
		}
	}

	if netStats, _ := netIOCounters(false); len(netStats) > 0 {
		m.NetRxKB = netStats[0].BytesRecv / 1024
		m.NetTxKB = netStats[0].BytesSent / 1024
	}

	m.Uptime, _ = hostUptime()

	procs, _ := processes()
	for _, p := range procs {
		name, _ := p.Name()
		cpuPct, _ := p.CPUPercent()
		memInfo, _ := p.MemoryInfo()

		var memMB uint64
		if memInfo != nil {
			memMB = memInfo.RSS / 1048576
		}

		m.TopProcs = append(m.TopProcs, ProcessInfo{
			PID: p.Pid, Name: name, CPU: cpuPct, MemMB: memMB,
		})
	}

	sort.Slice(m.TopProcs, func(i, j int) bool {
		return m.TopProcs[i].CPU > m.TopProcs[j].CPU
	})
	if len(m.TopProcs) > 10 {
		m.TopProcs = m.TopProcs[:10]
	}

	return m, nil
}

func Sparkline(data []float64, width int) string {
	if len(data) == 0 {
		return strings.Repeat(" ", width)
	}
	if len(data) > width {
		data = data[len(data)-width:]
	}

	var sb strings.Builder
	for _, v := range data {
		idx := int(math.Round(v / 100 * float64(len(sparkChars)-1)))
		idx = max(0, min(len(sparkChars)-1, idx))
		sb.WriteRune(rune(sparkChars[idx]))
	}

	return strings.Repeat(" ", width-len(data)) + sb.String()
}

func monitorJSON() error {
	m, err := GatherMetrics()
	if err != nil {
		return err
	}
	type procInfo struct {
		PID   int32   `json:"pid"`
		Name  string  `json:"name"`
		CPU   float64 `json:"cpu_percent"`
		MemMB uint64  `json:"mem_mb"`
	}
	procs := make([]procInfo, len(m.TopProcs))
	for i, p := range m.TopProcs {
		procs[i] = procInfo{PID: p.PID, Name: p.Name, CPU: p.CPU, MemMB: p.MemMB}
	}
	uptime := time.Duration(m.Uptime) * time.Second
	out, err := json.MarshalIndent(map[string]interface{}{
		"cpu_percent":   m.CPUTotal,
		"ram_percent":   m.RAMPct,
		"ram_used_gb":   m.RAMUsedGB,
		"ram_total_gb":  m.RAMTotalGB,
		"uptime":        uptime.String(),
		"top_processes": procs,
	}, "", "  ")
	if err != nil {
		return err
	}
	fmt.Println(string(out))
	return nil
}

func Bar(pct float64, width int) string {
	filled := int(math.Round(pct / 100 * float64(width)))
	filled = max(0, min(width, filled))
	return theme.StatusStyle(pct).Render(
		strings.Repeat("█", filled) + strings.Repeat("░", width-filled),
	)
}
