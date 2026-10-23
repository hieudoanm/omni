package ps

import (
	"encoding/json"
	"fmt"
	"math"
	"os/exec"
	"sort"
	"strconv"
	"strings"
)

var execCommand = exec.Command

type procEntry struct {
	PID   int     `json:"pid"`
	PPID  int     `json:"ppid,omitempty"`
	CPU   float64 `json:"cpu"`
	MEM   float64 `json:"mem"`
	RSS   int64   `json:"rss,omitempty"`
	VSZ   int64   `json:"vsz,omitempty"`
	Stat  string  `json:"stat,omitempty"`
	Comm  string  `json:"comm"`
	Human bool    `json:"-"`
}

func run(all bool, sortBy string, long, human, jsonOutput bool) error {
	var args []string
	format := "pid,ppid,pcpu,pmem,rss,vsz,stat,comm"
	if all {
		args = append(args, "-Ao", format)
	} else {
		args = append(args, "-o", format)
	}

	switch sortBy {
	case "cpu":
		args = append(args, "-r")
	case "mem":
		args = append(args, "-m")
	}

	out, err := execCommand("ps", args...).Output()
	if err != nil {
		return fmt.Errorf("ps failed: %w", err)
	}

	lines := strings.Split(strings.TrimSpace(string(out)), "\n")
	if len(lines) < 2 {
		return nil
	}

	var results []procEntry
	for _, line := range lines[1:] {
		fields := splitPSLine(line)
		if len(fields) < 8 {
			continue
		}
		pid, _ := strconv.Atoi(fields[0])
		ppid, _ := strconv.Atoi(fields[1])
		cpu, _ := strconv.ParseFloat(fields[2], 64)
		mem, _ := strconv.ParseFloat(fields[3], 64)
		rss, _ := strconv.ParseInt(fields[4], 10, 64)
		vsz, _ := strconv.ParseInt(fields[5], 10, 64)
		stat := fields[6]
		comm := fields[7]

		results = append(results, procEntry{
			PID: pid, PPID: ppid, CPU: cpu, MEM: mem,
			RSS: rss, VSZ: vsz, Stat: stat, Comm: comm,
			Human: human,
		})
	}

	sort.Slice(results, func(i, j int) bool {
		switch sortBy {
		case "cpu":
			return results[i].CPU > results[j].CPU
		case "mem":
			return results[i].MEM > results[j].MEM
		default:
			return results[i].PID < results[j].PID
		}
	})

	if jsonOutput {
		out, err := json.MarshalIndent(map[string]interface{}{
			"processes": results,
			"count":     len(results),
		}, "", "  ")
		if err != nil {
			return err
		}
		fmt.Println(string(out))
		return nil
	}

	if long {
		return outputLong(results)
	}
	return outputShort(results)
}

func outputShort(results []procEntry) error {
	headers := []string{"PID", "CPU%", "MEM%", "COMMAND"}
	rows := make([][]string, 0, len(results))
	for _, p := range results {
		rows = append(rows, []string{
			strconv.Itoa(p.PID),
			fmt.Sprintf("%.1f", p.CPU),
			fmt.Sprintf("%.1f", p.MEM),
			p.Comm,
		})
	}
	return printTable(headers, rows)
}

func outputLong(results []procEntry) error {
	sizeHeader := "RSS"
	if !results[0].Human {
		sizeHeader = "RSS (KB)"
	}
	headers := []string{"PID", "PPID", "CPU%", "MEM%", sizeHeader, "VSZ (KB)", "STAT", "COMMAND"}
	rows := make([][]string, 0, len(results))
	for _, p := range results {
		rss := fmt.Sprintf("%d", p.RSS)
		vsz := fmt.Sprintf("%d", p.VSZ)
		if p.Human {
			rss = humanSize(p.RSS * 1024)
			vsz = humanSize(p.VSZ * 1024)
		}
		rows = append(rows, []string{
			strconv.Itoa(p.PID),
			strconv.Itoa(p.PPID),
			fmt.Sprintf("%.1f", p.CPU),
			fmt.Sprintf("%.1f", p.MEM),
			rss,
			vsz,
			p.Stat,
			p.Comm,
		})
	}
	return printTable(headers, rows)
}

func splitPSLine(line string) []string {
	var fields []string
	parts := strings.Fields(line)
	if len(parts) >= 8 {
		fields = parts[:8]
		fields[7] = strings.Join(parts[7:], " ")
	}
	return fields
}

func printTable(headers []string, rows [][]string) error {
	colWidths := make([]int, len(headers))
	for i, h := range headers {
		colWidths[i] = len(h)
	}
	for _, row := range rows {
		for i, val := range row {
			if len(val) > colWidths[i] {
				colWidths[i] = len(val)
			}
		}
	}
	for i := range colWidths {
		if colWidths[i] < 3 {
			colWidths[i] = 3
		}
	}

	printSeparator(colWidths)
	fmt.Print("|")
	for i, h := range headers {
		fmt.Printf(" %-*s |", colWidths[i], h)
	}
	fmt.Println()
	printSeparator(colWidths)
	for _, row := range rows {
		fmt.Print("|")
		for i, val := range row {
			fmt.Printf(" %-*s |", colWidths[i], val)
		}
		fmt.Println()
	}
	printSeparator(colWidths)
	return nil
}

func printSeparator(colWidths []int) {
	fmt.Print("|")
	for _, w := range colWidths {
		fmt.Print(strings.Repeat("-", w+2) + "|")
	}
	fmt.Println()
}

func humanSize(bytes int64) string {
	if bytes == 0 {
		return "0B"
	}
	units := []string{"B", "K", "M", "G", "T"}
	i := int(math.Floor(math.Log(float64(bytes)) / math.Log(1024)))
	if i >= len(units) {
		i = len(units) - 1
	}
	val := float64(bytes) / math.Pow(1024, float64(i))
	if i == 0 {
		return fmt.Sprintf("%dB", bytes)
	}
	return fmt.Sprintf("%.1f%s", val, units[i])
}
