pub mod add_to_set;
pub mod remove_from_set;
pub mod replace_in_set;
pub mod send;
pub mod set_emoji_list;
pub mod set_keywords;
pub mod set_position;
pub mod set_thumbnail;
pub mod set_title;

use anyhow::Result;
use clap::{Args, Subcommand};

#[derive(Args)]
pub struct StickerArgs {
    #[command(subcommand)]
    pub command: Command,
}

#[derive(Subcommand)]
pub enum Command {
    /// Add a sticker to a set
    #[command(name = "add-to-set")]
    AddToSet(add_to_set::Args),
    /// Remove a sticker from a set
    #[command(name = "remove-from-set")]
    RemoveFromSet(remove_from_set::Args),
    /// Replace a sticker in a set
    #[command(name = "replace-in-set")]
    ReplaceInSet(replace_in_set::Args),
    /// Send a sticker
    Send(send::Args),
    /// Set sticker emoji list
    #[command(name = "set-emoji-list")]
    SetEmojiList(set_emoji_list::Args),
    /// Set sticker keywords
    #[command(name = "set-keywords")]
    SetKeywords(set_keywords::Args),
    /// Set sticker position in set
    #[command(name = "set-position")]
    SetPosition(set_position::Args),
    /// Set sticker set thumbnail
    #[command(name = "set-thumbnail")]
    SetThumbnail(set_thumbnail::Args),
    /// Set sticker set title
    #[command(name = "set-title")]
    SetTitle(set_title::Args),
}

pub fn run(args: &StickerArgs) -> Result<()> {
    match &args.command {
        Command::AddToSet(a) => add_to_set::run(a),
        Command::RemoveFromSet(a) => remove_from_set::run(a),
        Command::ReplaceInSet(a) => replace_in_set::run(a),
        Command::Send(a) => send::run(a),
        Command::SetEmojiList(a) => set_emoji_list::run(a),
        Command::SetKeywords(a) => set_keywords::run(a),
        Command::SetPosition(a) => set_position::run(a),
        Command::SetThumbnail(a) => set_thumbnail::run(a),
        Command::SetTitle(a) => set_title::run(a),
    }
}
