package promote

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "promote",
		Short:   "Promote a user in a chat",
		Long:    `Promote or demote a user to become an administrator in a supergroup or channel.`,
		Example: `  telegram chat promote --chat-id @channel --user-id 123456789 --can-delete-messages --can-invite-users`,
		RunE:    runE,
	}

	cmd.Flags().String("chat-id", "", "Target chat ID or @username")
	cmd.Flags().Int64("user-id", 0, "User ID to promote")
	cmd.Flags().Bool("is-anonymous", false, "Admin is anonymous")
	cmd.Flags().Bool("can-manage-chat", false, "Can manage the chat")
	cmd.Flags().Bool("can-delete-messages", false, "Can delete messages")
	cmd.Flags().Bool("can-manage-video-chats", false, "Can manage video chats")
	cmd.Flags().Bool("can-restrict-members", false, "Can restrict members")
	cmd.Flags().Bool("can-promote-members", false, "Can promote members")
	cmd.Flags().Bool("can-change-info", false, "Can change chat info")
	cmd.Flags().Bool("can-invite-users", false, "Can invite users")
	cmd.Flags().Bool("can-post-stories", false, "Can post stories")
	cmd.Flags().Bool("can-edit-stories", false, "Can edit stories")
	cmd.Flags().Bool("can-delete-stories", false, "Can delete stories")
	cmd.Flags().Bool("can-post-messages", false, "Can post messages (channels)")
	cmd.Flags().Bool("can-edit-messages", false, "Can edit messages (channels)")
	cmd.Flags().Bool("can-pin-messages", false, "Can pin messages")
	cmd.Flags().Bool("can-post-story", false, "Can post stories")
	cmd.Flags().Bool("can-manage-topics", false, "Can manage forum topics")

	return cmd
}
