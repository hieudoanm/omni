pub mod animation;
pub mod audio;
pub mod copy;
pub mod delete;
pub mod document;
pub mod edit;
pub mod forward;
pub mod media_group;
pub mod photo;
pub mod send;
pub mod video;
pub mod video_note;
pub mod voice;

use anyhow::Result;
use clap::{Args, Subcommand};

#[derive(Args)]
pub struct MessageArgs {
    #[command(subcommand)]
    pub command: Command,
}

#[derive(Subcommand)]
pub enum Command {
    /// Send an animation (GIF)
    Animation(animation::Args),
    /// Send an audio file
    Audio(audio::Args),
    /// Copy a message
    Copy(copy::Args),
    /// Delete a message
    Delete(delete::Args),
    /// Send a document
    Document(document::Args),
    /// Edit a message text
    Edit(edit::Args),
    /// Forward a message
    Forward(forward::Args),
    /// Send a media group
    #[command(name = "media-group")]
    MediaGroup(media_group::Args),
    /// Send a photo
    Photo(photo::Args),
    /// Send a Telegram message
    Send(send::Args),
    /// Send a video
    Video(video::Args),
    /// Send a video note
    #[command(name = "video-note")]
    VideoNote(video_note::Args),
    /// Send a voice message
    Voice(voice::Args),
}

pub fn run(args: &MessageArgs) -> Result<()> {
    match &args.command {
        Command::Animation(a) => animation::run(a),
        Command::Audio(a) => audio::run(a),
        Command::Copy(a) => copy::run(a),
        Command::Delete(a) => delete::run(a),
        Command::Document(a) => document::run(a),
        Command::Edit(a) => edit::run(a),
        Command::Forward(a) => forward::run(a),
        Command::MediaGroup(a) => media_group::run(a),
        Command::Photo(a) => photo::run(a),
        Command::Send(a) => send::run(a),
        Command::Video(a) => video::run(a),
        Command::VideoNote(a) => video_note::run(a),
        Command::Voice(a) => voice::run(a),
    }
}
