pub mod action;
pub mod ban;
pub mod create_invite_link;
pub mod edit_invite_link;
pub mod export_invite_link;
pub mod get;
pub mod leave;
pub mod pin;
pub mod promote;
pub mod restrict;
pub mod revoke_invite_link;
pub mod unban;

use anyhow::Result;
use clap::{Args, Subcommand};

#[derive(Args)]
pub struct ChatArgs {
    #[command(subcommand)]
    pub command: Command,
}

#[derive(Subcommand)]
pub enum Command {
    /// Send a chat action
    Action(action::Args),
    /// Ban a user from a chat
    Ban(ban::Args),
    /// Create an invite link
    #[command(name = "create-invite-link")]
    CreateInviteLink(create_invite_link::Args),
    /// Edit an invite link
    #[command(name = "edit-invite-link")]
    EditInviteLink(edit_invite_link::Args),
    /// Export primary invite link
    #[command(name = "export-invite-link")]
    ExportInviteLink(export_invite_link::Args),
    /// Get chat info
    Get(get::Args),
    /// Leave a chat
    Leave(leave::Args),
    /// Pin a message in a chat
    Pin(pin::Args),
    /// Promote a user in a chat
    Promote(promote::Args),
    /// Restrict a user in a chat
    Restrict(restrict::Args),
    /// Revoke an invite link
    #[command(name = "revoke-invite-link")]
    RevokeInviteLink(revoke_invite_link::Args),
    /// Unban a user from a chat
    Unban(unban::Args),
}

pub fn run(args: &ChatArgs) -> Result<()> {
    match &args.command {
        Command::Action(a) => action::run(a),
        Command::Ban(a) => ban::run(a),
        Command::CreateInviteLink(a) => create_invite_link::run(a),
        Command::EditInviteLink(a) => edit_invite_link::run(a),
        Command::ExportInviteLink(a) => export_invite_link::run(a),
        Command::Get(a) => get::run(a),
        Command::Leave(a) => leave::run(a),
        Command::Pin(a) => pin::run(a),
        Command::Promote(a) => promote::run(a),
        Command::Restrict(a) => restrict::run(a),
        Command::RevokeInviteLink(a) => revoke_invite_link::run(a),
        Command::Unban(a) => unban::run(a),
    }
}
