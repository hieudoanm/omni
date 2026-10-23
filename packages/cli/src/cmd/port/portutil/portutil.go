package portutil

import (
	"net"
	"sort"
	"strconv"
	"strings"
	"time"
)

var CommonPorts = map[int]string{
	21: "FTP", 22: "SSH", 23: "Telnet", 25: "SMTP",
	53: "DNS", 80: "HTTP", 110: "POP3", 143: "IMAP",
	443: "HTTPS", 465: "SMTPS", 587: "SMTP Submission",
	993: "IMAPS", 995: "POP3S", 1433: "MSSQL",
	3306: "MySQL", 3389: "RDP", 5432: "PostgreSQL",
	6379: "Redis", 8080: "HTTP-Alt", 8443: "HTTPS-Alt",
	27017: "MongoDB",
}

func BuildPortList(s string) []int {
	if s == "" {
		keys := make([]int, 0, len(CommonPorts))
		for k := range CommonPorts {
			keys = append(keys, k)
		}
		sort.Ints(keys)
		return keys
	}

	var ports []int
	for _, part := range strings.Split(s, ",") {
		part = strings.TrimSpace(part)
		if strings.Contains(part, "-") {
			parts := strings.SplitN(part, "-", 2)
			start, err1 := strconv.Atoi(strings.TrimSpace(parts[0]))
			end, err2 := strconv.Atoi(strings.TrimSpace(parts[1]))
			if err1 == nil && err2 == nil && start <= end {
				for p := start; p <= end; p++ {
					ports = append(ports, p)
				}
			}
		} else {
			if p, err := strconv.Atoi(part); err == nil {
				ports = append(ports, p)
			}
		}
	}
	sort.Ints(ports)
	return ports
}

func CheckPortOpen(addr string, timeout int) bool {
	conn, err := net.DialTimeout("tcp", addr, time.Duration(timeout)*time.Second)
	if conn != nil {
		conn.Close()
	}
	return err == nil
}
