import test from "node:test";
import assert from "node:assert/strict";
import { createAudioConfig } from "./audio.node.js";

test("uses the local demo track without configuration", () => {
  const config = createAudioConfig({});
  assert.equal(config.source, "local");
  assert.equal(config.invalidCustom, undefined);
  assert.equal(config.tracks.length, 3);
  assert.equal(config.tracks[0].url, "./media/lanze-qingshan.wav");
  assert.equal(config.tracks[0].cover, "./media/lanze-qingshan-cover.svg");
  assert.equal(config.tracks[0].duration, 24);
});

test("uses an explicit custom playlist only when enabled", () => {
  const tracks = [
    { name: "示例", artist: "作者", url: "/audio/demo.mp3", cover: "/audio/cover.svg" },
    { url: "https://audio.example.test/second.mp3" },
  ];
  const config = createAudioConfig({
    VITE_AUDIO_SOURCE: "custom",
    VITE_AUDIO_TRACKS: JSON.stringify(tracks),
  });

  assert.equal(config.source, "custom");
  assert.deepEqual(config.tracks, [
    { name: "示例", artist: "作者", url: "/audio/demo.mp3", cover: "/audio/cover.svg" },
    { name: "未命名音轨", artist: "未标注作者", url: "https://audio.example.test/second.mp3" },
  ]);
  assert.equal(createAudioConfig({ VITE_AUDIO_TRACKS: JSON.stringify(tracks) }).source, "local");
});

test("falls back to the local track for invalid custom configuration", () => {
  const invalidJson = createAudioConfig({ VITE_AUDIO_SOURCE: "custom", VITE_AUDIO_TRACKS: "{" });
  const emptyList = createAudioConfig({ VITE_AUDIO_SOURCE: "custom", VITE_AUDIO_TRACKS: "[]" });

  for (const config of [invalidJson, emptyList]) {
    assert.equal(config.source, "local");
    assert.equal(config.invalidCustom, true);
    assert.equal(config.tracks[0].url, "./media/lanze-qingshan.wav");
  }
});
