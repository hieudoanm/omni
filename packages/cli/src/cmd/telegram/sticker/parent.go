package sticker

import (
	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/sticker/add_to_set"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/sticker/remove_from_set"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/sticker/replace_in_set"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/sticker/send"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/sticker/set_emoji_list"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/sticker/set_keywords"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/sticker/set_position"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/sticker/set_thumbnail"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/sticker/set_title"
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "sticker",
		Short: "Send stickers",
		Long:  `Send stickers and custom emoji to Telegram chats.`,
		Example: `  telegram sticker send --chat-id @channel --sticker CAACAgIAAxkBAAIB
  telegram sticker set-title --name "my_set" --title "New Title"`,
		RunE: func(cmd *cobra.Command, args []string) error { return cmd.Help() },
	}
	cmd.AddCommand(add_to_set.NewCmd())
	cmd.AddCommand(remove_from_set.NewCmd())
	cmd.AddCommand(replace_in_set.NewCmd())
	cmd.AddCommand(send.NewCmd())
	cmd.AddCommand(set_emoji_list.NewCmd())
	cmd.AddCommand(set_keywords.NewCmd())
	cmd.AddCommand(set_position.NewCmd())
	cmd.AddCommand(set_thumbnail.NewCmd())
	cmd.AddCommand(set_title.NewCmd())
	return cmd
}
