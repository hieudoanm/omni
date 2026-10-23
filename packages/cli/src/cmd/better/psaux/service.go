package psaux

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

type psauxEntry struct {
	User    string  `json:"user"`
	PID     int     `json:"pid"`
	CPU     float64 `json:"cpu"`
	MEM     float64 `json:"mem"`
	RSS     int64   `json:"rss"`
	VSZ     int64   `json:"vsz"`
	TTY     string  `json:"tty"`
	Stat    string  `json:"stat"`
	Started string  `json:"started"`
	Time    string  `json:"time"`
	Comm    string  `json:"comm"`
}

func run(sortBy, user string, jsonOutput bool) error {
	format := "user,pid,pcpu,pmem,rss,vsz,tty,stat,lstart,time,comm"
	out, err := execCommand("ps", "-Ao", format).Output()
	if err != nil {
		return fmt.Errorf("ps failed: %w", err)
	}

	lines := strings.Split(strings.TrimSpace(string(out)), "\n")
	if len(lines) < 2 {
		return nil
	}

	var results []psauxEntry
	for _, line := range lines[1:] {
		fields := splitLine(line)
		if len(fields) < 11 {
			continue
		}
		pid, _ := strconv.Atoi(fields[1])
		cpu, _ := strconv.ParseFloat(fields[2], 64)
		mem, _ := strconv.ParseFloat(fields[3], 64)
		rss, _ := strconv.ParseInt(fields[4], 10, 64)
		vsz, _ := strconv.ParseInt(fields[5], 10, 64)

		entry := psauxEntry{
			User: fields[0], PID: pid, CPU: cpu, MEM: mem,
			RSS: rss, VSZ: vsz, TTY: fields[6], Stat: fields[7],
			Started: fields[8], Time: fields[9], Comm: fields[10],
		}

		if user != "" && !strings.EqualFold(entry.User, user) {
			continue
		}

		results = append(results, entry)
	}

	sort.Slice(results, func(i, j int) bool {
		switch sortBy {
		case "cpu":
			return results[i].CPU > results[j].CPU
		case "mem":
			return results[i].MEM > results[j].MEM
		case "user":
			return strings.ToLower(results[i].User) < strings.ToLower(results[j].User)
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

	headers := []string{"USER", "PID", "CPU%", "MEM%", "RSS (KB)", "VSZ (KB)", "STAT", "TIME", "COMMAND"}
	rows := make([][]string, 0, len(results))
	for _, p := range results {
		rows = append(rows, []string{
			p.User,
			strconv.Itoa(p.PID),
			fmt.Sprintf("%.1f", p.CPU),
			fmt.Sprintf("%.1f", p.MEM),
			strconv.FormatInt(p.RSS, 10),
			strconv.FormatInt(p.VSZ, 10),
			p.Stat,
			p.Time,
			p.Comm,
		})
	}
	return printTable(headers, rows)
}

func splitLine(line string) []string {
	var fields []string
	parts := strings.Fields(line)
	if len(parts) >= 11 {
		fields = parts[:11]
		fields[10] = strings.Join(parts[10:], " ")
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
