package status

import (
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/hieudoanm/omni/packages/cli/src/libs/colors"
	"github.com/hieudoanm/omni/packages/cli/src/libs/requests"
)

var netFetch = requests.Get

var Services = map[string]map[string]string{
	"atlassian": {
		"analytics":               "https://analytics.status.atlassian.com/api/v2/status.json",
		"atlas":                   "https://atlas.status.atlassian.com/api/v2/status.json",
		"compass":                 "https://compass.status.atlassian.com/api/v2/status.json",
		"confluence":              "https://confluence.status.atlassian.com/api/v2/status.json",
		"developer":               "https://developer.status.atlassian.com/api/v2/status.json",
		"guard":                   "https://guard.status.atlassian.com/api/v2/status.json",
		"jira-service-management": "https://jira-service-management.status.atlassian.com/api/v2/status.json",
		"jira-software":           "https://jira-software.status.atlassian.com/api/v2/status.json",
		"opsgenie":                "https://opsgenie.status.atlassian.com/api/v2/status.json",
		"partners":                "https://partners.status.atlassian.com/api/v2/status.json",
		"support":                 "https://support.status.atlassian.com/api/v2/status.json",
		"trello":                  "https://trello.status.atlassian.com/api/v2/status.json",
	},
	"crypto": {
		"hedera":  "https://status.hedera.com/api/v2/status.json",
		"polygon": "https://status.polygon.technology/api/v2/status.json",
		"solana":  "https://status.solana.com/api/v2/status.json",
	},
	"serverless": {
		"cloudflare": "https://www.cloudflarestatus.com/api/v2/status.json",
		"flyio":      "https://status.flyio.net/api/v2/status.json",
		"netlify":    "https://www.netlifystatus.com/api/v2/status.json",
		"render":     "https://status.render.com/api/v2/status.json",
		"supabase":   "https://status.supabase.com/api/v2/status.json",
		"vercel":     "https://www.vercel-status.com/api/v2/status.json",
	},
	"saas": {
		"bitbucket": "https://bitbucket.status.atlassian.com/api/v2/status.json",
		"github":    "https://www.githubstatus.com/api/v2/status.json",
		"npm":       "https://status.npmjs.org/api/v2/status.json",
		"canva":     "https://www.canvastatus.com/api/v2/status.json",
		"figma":     "https://status.figma.com/api/v2/status.json",
	},
}

type Page struct {
	Id        string `json:"id"`
	Name      string `json:"name"`
	Url       string `json:"url"`
	TimeZone  string `json:"time_zone"`
	UpdatedAt string `json:"updated_at"`
}

type Status struct {
	Indicator   string `json:"indicator"`
	Description string `json:"description"`
}

type Response struct {
	Page   Page   `json:"page"`
	Status Status `json:"status"`
}

func GetStatus(url string, debug bool) (Response, error) {
	responseByte, err := netFetch(url, requests.Options{Debug: debug})
	if err != nil {
		return Response{}, err
	}
	return parseStatusResponse(responseByte)
}

func parseStatusResponse(body []byte) (Response, error) {
	var response Response
	if err := json.Unmarshal(body, &response); err != nil {
		return Response{}, err
	}
	return response, nil
}

func PrintFullStatus(url string, debug bool) {
	resp, err := GetStatus(url, debug)
	if err != nil {
		log.Printf("[%s] %s\n", time.Now().Format(time.RFC3339), colors.Red("Error: "+err.Error()))
		return
	}

	timestamp := time.Now().Format(time.RFC3339)
	border := colors.Blue(fmt.Sprintf("==================== STATUS PAGE ==================== [%s]", timestamp))

	fmt.Println(border)
	fmt.Printf("%sPage Name    :%s %s\n", colors.Cyan(""), "", resp.Page.Name)
	fmt.Printf("%sPage ID      :%s %s\n", colors.Cyan(""), "", resp.Page.Id)
	fmt.Printf("%sURL          :%s %s\n", colors.Cyan(""), "", resp.Page.Url)
	fmt.Printf("%sTime Zone    :%s %s\n", colors.Cyan(""), "", resp.Page.TimeZone)
	fmt.Printf("%sUpdated At   :%s %s\n", colors.Cyan(""), "", resp.Page.UpdatedAt)
	fmt.Printf("%sIndicator    :%s %s\n", colors.Green(""), "", resp.Status.Indicator)
	fmt.Printf("%sDescription  :%s %s\n", colors.Yellow(""), "", resp.Status.Description)
	fmt.Println(border)
}

func GetDescriptiveStatus(name string, url string, debug bool) string {
	resp, err := GetStatus(url, debug)
	if err != nil {
		return colors.Red("Error: " + err.Error())
	}
	return descriptiveStatusFromResponse(resp)
}

func descriptiveStatusFromResponse(resp Response) string {
	if resp.Status.Indicator == "none" {
		return "Healthy"
	}
	return "Offline"
}

func PrintDescriptiveStatus(name string, url string, debug bool) {
	resp, err := GetStatus(url, debug)
	if err != nil {
		log.Printf("[%s] %s\n", time.Now().Format(time.RFC3339), colors.Red("Error: "+err.Error()))
		return
	}
	timestamp := time.Now().Format(time.RFC3339)
	fmt.Printf("[%s] %s%s : %s%s\n", timestamp, colors.Yellow(""), name, resp.Status.Description, "")
}
