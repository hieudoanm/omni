package rgb

import (
	"bufio"
	"encoding/json"
	"fmt"
	"os"
	"strconv"
	"strings"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/colors/internal"
	"github.com/spf13/cobra"
)

func convertRGB(r, g, b int) string {
	var buf strings.Builder
	rgb := internal.RGB{R: r, G: g, B: b}
	hexStr, err := rgb.ToHex()
	if err != nil {
		fmt.Fprintln(&buf, "Error (HEX)  :", err)
	} else {
		fmt.Fprintf(&buf, "HEX    : %s\n", hexStr)
	}
	hHSL, sHSL, lHSL, err := rgb.ToHSL()
	if err != nil {
		fmt.Fprintln(&buf, "Error (HSL)  :", err)
	} else {
		fmt.Fprintf(&buf, "HSL    : h=%.2f°, s=%.2f%%, l=%.2f%%\n", hHSL, sHSL, lHSL)
	}
	hHCL, cHCL, lHCL, err := rgb.ToHCL()
	if err != nil {
		fmt.Fprintln(&buf, "Error (HCL)  :", err)
	} else {
		fmt.Fprintf(&buf, "HCL    : h=%.2f°, c=%.2f, l=%.2f\n", hHCL, cHCL, lHCL)
	}
	oklL, oklC, oklH, err := rgb.ToOKLCH()
	if err != nil {
		fmt.Fprintln(&buf, "Error (OKLCH):", err)
	} else {
		fmt.Fprintf(&buf, "OKLCH  : L=%.3f, C=%.3f, H=%.2f°\n", oklL, oklC, oklH)
	}
	cy, m, y, k, err := rgb.ToCMYK()
	if err != nil {
		fmt.Fprintln(&buf, "Error (CMYK) :", err)
	} else {
		fmt.Fprintf(&buf, "CMYK   : C=%.3f, M=%.3f, Y=%.3f, K=%.3f\n", cy, m, y, k)
	}
	return strings.TrimRight(buf.String(), "\n")
}

func runRGB(cmd *cobra.Command, args []string) error {
	jsonOutput, _ := cmd.Flags().GetBool("json")
	reader := bufio.NewReader(os.Stdin)
	fmt.Print("R (0-255): ")
	rStr, _ := reader.ReadString('\n')
	rStr = strings.TrimSpace(rStr)
	r, err := strconv.Atoi(rStr)
	if err != nil {
		fmt.Println("Error (R)    :", err)
		return nil
	}
	fmt.Print("G (0-255): ")
	gStr, _ := reader.ReadString('\n')
	gStr = strings.TrimSpace(gStr)
	g, err := strconv.Atoi(gStr)
	if err != nil {
		fmt.Println("Error (G)    :", err)
		return nil
	}
	fmt.Print("B (0-255): ")
	bStr, _ := reader.ReadString('\n')
	bStr = strings.TrimSpace(bStr)
	b, err := strconv.Atoi(bStr)
	if err != nil {
		fmt.Println("Error (B)    :", err)
		return nil
	}
	if jsonOutput {
		rgb := internal.RGB{R: r, G: g, B: b}
		hexStr, _ := rgb.ToHex()
		hHCL, cHCL, lHCL, _ := rgb.ToHCL()
		oklL, oklC, oklH, _ := rgb.ToOKLCH()
		out, _ := json.MarshalIndent(map[string]interface{}{
			"hex":   hexStr,
			"rgb":   fmt.Sprintf("rgb(%d, %d, %d)", r, g, b),
			"hcl":   fmt.Sprintf("h=%.2f°, c=%.2f, l=%.2f", hHCL, cHCL, lHCL),
			"oklch": fmt.Sprintf("L=%.3f, C=%.3f, H=%.2f°", oklL, oklC, oklH),
		}, "", "  ")
		fmt.Println(string(out))
		return nil
	}
	fmt.Print(convertRGB(r, g, b))
	return nil
}
