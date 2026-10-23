package telegram

import (
	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/bot"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/callback"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/chat"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/contact"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/dice"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/forum"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/game"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/gift"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/inline"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/invoice"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/location"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/message"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/poll"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/sticker"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/venue"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/webhook"
	"github.com/spf13/cobra"
)

func NewCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "telegram",
		Short: "Telegram bot and message tools",
		Long:  `Tools for interacting with the Telegram Bot API: send messages and manage webhooks.`,
		Example: `  telegram message send --chat-id @channel --text "Hello"
  telegram message photo --chat-id @channel --photo https://example.com/img.jpg
  telegram message edit --chat-id @channel --message-id 42 --text "Edited"
  telegram message delete --chat-id @channel --message-id 42
  telegram chat action --chat-id @channel --action typing
  telegram chat get --chat-id @channel
  telegram location send --chat-id @channel --latitude 48.85 --longitude 2.35
  telegram venue send --chat-id @channel --latitude 48.85 --longitude 2.35 --title "Place" --address "Addr"
  telegram contact send --chat-id @channel --phone-number "+123" --first-name "John"
  telegram poll send --chat-id @channel --question "?" --options '[{"text":"A"},{"text":"B"}]'
  telegram dice --chat-id @channel
  telegram sticker send --chat-id @channel --sticker FILE_ID
  telegram bot get-me
  telegram webhook set --url https://example.com/webhook
  telegram webhook info
  telegram webhook delete
  telegram forum create --chat-id @channel --name "Topic"
  telegram game send --chat-id @channel --game-short-name "mygame"
  telegram callback answer --callback-query-id "12345" --text "Done!"
  telegram inline answer --inline-query-id "12345" --results '[{"type":"article","id":"1","title":"Result","input_message_content":{"message_text":"Hello"}}]'
  telegram invoice create --title "Item" --description "Desc" --payload "{}" --currency XTR --prices '[{"label":"Item","amount":1}]'
  telegram gift send --user-id 12345 --gift-id "gift_id"`,
		RunE: func(cmd *cobra.Command, args []string) error { return cmd.Help() },
	}
	cmd.PersistentFlags().BoolP("json", "j", false, "Output in JSON format")
	cmd.PersistentFlags().StringP("token", "t", "", "Telegram Bot API token (or set TELEGRAM_BOT_TOKEN)")
	cmd.AddCommand(message.NewCmd())
	cmd.AddCommand(webhook.NewCmd())
	cmd.AddCommand(chat.NewCmd())
	cmd.AddCommand(location.NewCmd())
	cmd.AddCommand(venue.NewCmd())
	cmd.AddCommand(contact.NewCmd())
	cmd.AddCommand(poll.NewCmd())
	cmd.AddCommand(dice.NewCmd())
	cmd.AddCommand(sticker.NewCmd())
	cmd.AddCommand(bot.NewCmd())
	cmd.AddCommand(forum.NewCmd())
	cmd.AddCommand(game.NewCmd())
	cmd.AddCommand(callback.NewCmd())
	cmd.AddCommand(inline.NewCmd())
	cmd.AddCommand(invoice.NewCmd())
	cmd.AddCommand(gift.NewCmd())
	return cmd
}
