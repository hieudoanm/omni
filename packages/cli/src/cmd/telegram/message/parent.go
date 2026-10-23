package message

import (
	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/message/animation"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/message/audio"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/message/copy"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/message/delete"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/message/document"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/message/edit"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/message/forward"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/message/media_group"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/message/photo"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/message/send"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/message/video"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/message/video_note"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/message/voice"
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "message",
		Short: "Send Telegram messages",
		Long:  `Send, edit, delete, copy, forward messages and media via the Telegram Bot API.`,
		Example: `  telegram message send --chat-id @channel --text "Hello"
  telegram message edit --chat-id @channel --message-id 42 --text "Edited"
  telegram message delete --chat-id @channel --message-id 42
  telegram message copy --chat-id @channel --from-chat-id @other --message-id 7
  telegram message forward --chat-id @channel --from-chat-id @other --message-id 7
  telegram message photo --chat-id @channel --photo https://example.com/img.jpg`,
		RunE: func(cmd *cobra.Command, args []string) error { return cmd.Help() },
	}
	cmd.AddCommand(animation.NewCmd())
	cmd.AddCommand(audio.NewCmd())
	cmd.AddCommand(copy.NewCmd())
	cmd.AddCommand(delete.NewCmd())
	cmd.AddCommand(document.NewCmd())
	cmd.AddCommand(edit.NewCmd())
	cmd.AddCommand(forward.NewCmd())
	cmd.AddCommand(media_group.NewCmd())
	cmd.AddCommand(photo.NewCmd())
	cmd.AddCommand(send.NewCmd())
	cmd.AddCommand(video.NewCmd())
	cmd.AddCommand(video_note.NewCmd())
	cmd.AddCommand(voice.NewCmd())
	return cmd
}
