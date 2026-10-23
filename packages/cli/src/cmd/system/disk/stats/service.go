package stats

import (
	"fmt"
	"sort"

	"github.com/shirou/gopsutil/v4/disk"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/system/disk/internal"
	"github.com/hieudoanm/omni/packages/cli/src/libs/theme"
)

func statsRun(showAll bool) error {
	partitions, err := disk.Partitions(!showAll)
	if err != nil {
		return fmt.Errorf("disk stats: %w", err)
	}

	sort.Slice(partitions, func(i, j int) bool {
		return partitions[i].Mountpoint < partitions[j].Mountpoint
	})

	for _, p := range partitions {
		usage, err := disk.Usage(p.Mountpoint)
		if err != nil {
			fmt.Printf("  %-30s  %s\n", p.Mountpoint, theme.Error.Render("error"))
			continue
		}

		used := internal.DiskLabel(usage.Used)
		total := internal.DiskLabel(usage.Total)
		free := internal.DiskLabel(usage.Free)
		pct := usage.UsedPercent

		bar := theme.StatusStyle(pct).Render(
			fmt.Sprintf("%.1f%%", pct),
		)

		fmt.Printf("  %-30s  %s used / %s free / %s total  %s\n",
			p.Mountpoint, used, free, total, bar)
	}

	return nil
}
