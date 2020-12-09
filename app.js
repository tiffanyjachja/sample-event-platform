/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this
 * software and associated documentation files (the "Software"), to deal in the Software
 * without restriction, including without limitation the rights to use, copy, modify,
 * merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// Configuration
const channelArn = "arn:aws:ivs:us-west-2:913157848533:channel/rkCBS9iD1eyd";
const playbackUrl =
  "https://3d26876b73d7.us-west-2.playback.live-video.net/api/video/v1/us-west-2.913157848533.channel.rkCBS9iD1eyd.m3u8";
const endpoints = {
  metadata: `https://h1r3ebcb0g.execute-api.us-west-2.amazonaws.com/metadata?channelArn=${channelArn}`
};

// App
const videoPlayer = document.getElementById("video-player");
const emojiContainer = document.querySelector(".overlay");
const clientId = `${Math.random()
  .toString()
  .slice(2)}${Math.random().toString().slice(2)}`;
const ICON_REMOVE_TIME = 2000;
const ICON_FADE_START_TIME = 1000;
const iconTypeMap = {
  star: "🌟",
  "100": "💯",
  clap: "👏",
  tada: "🎉",
  laugh: "😂"
};
let selectedEmoji = "clap";

main();

(function (IVSPlayer) {
  const PlayerState = IVSPlayer.PlayerState;
  const PlayerEventType = IVSPlayer.PlayerEventType;

  // Initialize player
  const player = IVSPlayer.create();
  player.attachHTMLVideoElement(videoPlayer);

  player.addEventListener(PlayerEventType.TEXT_METADATA_CUE, handleMetadata);

  // Setup stream and play
  player.setAutoplay(true);
  player.load(playbackUrl);
  player.setVolume(0);
})(window.IVSPlayer);

function handleMetadata(metadata) {
  const jsonText = metadata.text;
  let json;
  try {
    json = JSON.parse(jsonText);
  } catch (e) {
    console.error(`Failed to parse json error: ${e} input: ${jsonText}`);
    return;
  }

  if (json.type && json.x !== undefined && json.y !== undefined) {
    if (json.senderId !== clientId) {
      renderIcon(json);
    }
  }
}

function handleAddEmoji(event) {
  const bounds = emojiContainer.getBoundingClientRect();
  const x = (event.clientX - bounds.left) / bounds.width;
  const y = (event.clientY - bounds.top) / bounds.height;
  const icon = { x: x, y: y, type: selectedEmoji, senderId: clientId };
  renderIcon(icon);
  notifyStream(icon);
}

function handleEmojiToggle(event) {
  const id = event.target.getAttribute("data-id");
  if (!id) {
    return;
  }

  selectedEmoji = id;
  updateEmojiSelection();
}
function handleEmojiToggle(event) {
  const id = event.target.getAttribute("data-id");
  if (!id) {
    return;
  }

  selectedEmoji = id;
  updateEmojiSelection();
}

function renderIcon(icon) {
  const iconEl = document.createElement("div");
  iconEl.classList.add("icon");
  iconEl.innerText = iconTypeMap[icon.type];
  iconEl.style.top = `calc(${icon.y * 100}% - 18px)`;
  iconEl.style.left = `calc(${icon.x * 100}% - 18px)`;
  emojiContainer.append(iconEl);

  setTimeout(() => {
    iconEl.classList.add("fade");
  }, ICON_FADE_START_TIME);
  setTimeout(() => {
    iconEl.remove();
  }, ICON_REMOVE_TIME);
}

function notifyStream(icon) {
  const url = endpoints.metadata;
  fetch(url, { method: "POST", body: JSON.stringify(icon) });
}

function updateEmojiSelection() {
  clearActiveSelection();
  const el = document.querySelector(`[data-id="${selectedEmoji}"].emoji-btn`);
  if (!el) {
    console.error(`Invalid emoji ${selectedEmoji} not found`);
  } else {
    el.classList.add("active");
  }
}

function clearActiveSelection() {
  [].forEach.call(document.getElementsByClassName("emoji-btn"), function (el) {
    el.classList.remove("active");
  });
}

function main() {
  emojiContainer.addEventListener("click", handleAddEmoji);
  document
    .querySelector(".emoji-picker")
    .addEventListener("click", handleEmojiToggle);
  updateEmojiSelection();
}

