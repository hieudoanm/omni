package disk

import (
	"encoding/json"
	"fmt"
	"sort"

	"github.com/shirou/gopsutil/v4/disk"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/system/disk/internal"
	"github.com/hieudoanm/omni/packages/cli/src/libs/theme"
)

type diskType struct {
	Mount       string  `json:"mount"`
	Fstype      string  `json:"fstype"`
	Total       uint64  `json:"total"`
	Used        uint64  `json:"used"`
	Free        uint64  `json:"free"`
	UsedPercent float64 `json:"used_percent"`
}

func runDisk(showJSON bool, filter string, sortBySize bool) error {
	partitions, err := disk.Partitions(false)
	if err != nil {
		return fmt.Errorf("disk: %w", err)
	}

	var disks []diskType
	for _, p := range partitions {
		if filter != "" && !containsFold(p.Mountpoint, filter) && !containsFold(p.Device, filter) {
			continue
		}

		usage, err := disk.Usage(p.Mountpoint)
		if err != nil {
			continue
		}

		disks = append(disks, diskType{
			Mount:       p.Mountpoint,
			Fstype:      p.Fstype,
			Total:       usage.Total,
			Used:        usage.Used,
			Free:        usage.Free,
			UsedPercent: usage.UsedPercent,
		})
	}

	if sortBySize {
		sort.Slice(disks, func(i, j int) bool {
			return disks[i].UsedPercent > disks[j].UsedPercent
		})
	}

	if showJSON {
		b, _ := json.MarshalIndent(disks, "", "  ")
		fmt.Println(string(b))
	} else {
		fmt.Printf("%-35s %-10s %12s %12s %12s %s\n", "Filesystem", "Type", "Total", "Used", "Free", "Use%")
		for _, d := range disks {
			fmt.Printf("%-35s %-10s %12s %12s %12s %s\n",
				d.Mount, d.Fstype,
				internal.DiskLabel(d.Total), internal.DiskLabel(d.Used), internal.DiskLabel(d.Free),
				theme.StatusStyle(d.UsedPercent).Render(fmt.Sprintf("%.1f%%", d.UsedPercent)),
			)
		}
	}
	return nil
}

func containsFold(s, substr string) bool {
	return containsIgnoreCase(s, substr)
}

func containsIgnoreCase(s, substr string) bool {
	if len(substr) == 0 {
		return true
	}
	if len(substr) > len(s) {
		return false
	}
	for i := 0; i <= len(s)-len(substr); i++ {
		match := true
		for j := 0; j < len(substr); j++ {
			if toLower(s[i+j]) != toLower(substr[j]) {
				match = false
				break
			}
		}
		if match {
			return true
		}
	}
	return false
}

func toLower(b byte) byte {
	if b >= 'A' && b <= 'Z' {
		return b + 32
	}
	return b
}
