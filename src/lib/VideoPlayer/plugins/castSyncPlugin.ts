import {MediaPlaylist} from "hls.js";

import Plugin from '@nomercy-entertainment/nomercy-video-player/src/plugin';
import type {NMPlayer, PlaylistItem, TimeData, Track} from "@nomercy-entertainment/nomercy-video-player/src/types";

import {useCastSocket} from "@/store/socket";
import {initializeCastSocket} from "@/lib/socketClient/initializeSocket";

export interface CastSyncPluginArgs {
    basePath: string,
    accessToken: string,
}

export class CastSyncPlugin extends Plugin {
    player: NMPlayer<CastSyncPluginArgs> = <NMPlayer<CastSyncPluginArgs>>{};

    async initialize(player: NMPlayer<CastSyncPluginArgs>) {
        this.player = player;

        await initializeCastSocket(player.options.basePath, player.options.accessToken)
            .then(() => {
                const socket = useCastSocket();
                socket?.on('GetPlayerState', this.getPlayerState.bind(this));
                socket?.on('SetAudioTrack', this.setAudioTrack.bind(this));
                socket?.on('SetSubtitleTrack', this.setSubtitleTrack.bind(this));
                socket?.on('SetPlaylistItem', this.setPlaylistItem.bind(this));
                socket?.on('SetVolume', this.setVolume.bind(this));
                socket?.on('SetPlay', this.setPlay.bind(this));
                socket?.on('SetPause', this.setPause.bind(this));
                socket?.on('SetSeek', this.setSeek.bind(this));
                socket?.on('SetNext', this.setNext.bind(this));
                socket?.on('SetPrevious', this.setPrevious.bind(this));
            });
    }

    use() {
        this.player.on('time', this.time.bind(this));
        this.player.on('play', this.play.bind(this));
        this.player.on('pause', this.pause.bind(this));
        this.player.on('stop', this.stop.bind(this));
        this.player.on('seek', this.seek.bind(this));
        this.player.on('ended', this.ended.bind(this));
        this.player.on('item', this.item.bind(this));
        this.player.on('volume', this.volume.bind(this));
        this.player.on('muted', this.muted.bind(this));
        this.player.on('playlist', this.playlist.bind(this));
        this.player.on('audioTracks', this.audioTracks.bind(this));
        this.player.on('currentAudioTrack', this.currentAudioTrack.bind(this));
        this.player.on('subtitles', this.subtitles.bind(this));
        this.player.on('currentSubtitleTrack', this.currentSubtitleTrack.bind(this));
        this.player.on('lastTimeTrigger', this.getPlayerState.bind(this));
    }

    dispose() {
        // @ts-ignore
        this.player.off('time', this.time.bind(this));
        this.player.off('play', this.play.bind(this));
        this.player.off('pause', this.pause.bind(this));
        this.player.off('stop', this.stop.bind(this));
        // @ts-ignore
        this.player.off('seek', this.seek.bind(this));
        this.player.off('ended', this.ended.bind(this));
        // @ts-ignore
        this.player.off('item', this.item.bind(this));
        // @ts-ignore
        this.player.off('volume', this.volume.bind(this));
        // @ts-ignore
        this.player.off('muted', this.muted.bind(this));
        // @ts-ignore
        this.player.off('playlist', this.playlist.bind(this));
        // @ts-ignore
        this.player.off('audioTracks', this.audioTracks.bind(this));
        // @ts-ignore
        this.player.off('currentAudioTrack', this.currentAudioTrack.bind(this));
        // @ts-ignore
        this.player.off('subtitles', this.subtitles.bind(this));
        // @ts-ignore
        this.player.off('currentSubtitleTrack', this.currentSubtitleTrack.bind(this));
        // @ts-ignore
        this.player.off('lastTimeTrigger', this.getPlayerState.bind(this));

        const socket = useCastSocket();
        socket?.off('GetPlayerState', this.getPlayerState.bind(this));
        socket?.off('SetAudioTrack', this.setAudioTrack.bind(this));
        socket?.off('SetSubtitleTrack', this.setSubtitleTrack.bind(this));
        socket?.off('SetPlaylistItem', this.setPlaylistItem.bind(this));
        socket?.off('SetVolume', this.setVolume.bind(this));
        socket?.off('SetSeek', this.setSeek.bind(this));
        socket?.off('SetPlay', this.setPlay.bind(this));
        socket?.off('SetPause', this.setPause.bind(this));
        socket?.off('SetSeek', this.setSeek.bind(this));
        socket?.off('SetNext', this.setNext.bind(this));
        socket?.off('SetPrevious', this.setPrevious.bind(this));

    }


    play() {
        const socket = useCastSocket();
        socket?.invoke?.('Play');
    }

    pause() {
        const socket = useCastSocket();
        socket?.invoke?.('Pause');
    }

    stop() {
        const socket = useCastSocket();
        socket?.invoke?.('Stop');
    }

    time(data: TimeData) {
        const socket = useCastSocket();
        socket?.invoke?.('Time', data);
    }

    seek(value: number) {
        const socket = useCastSocket();
        socket?.invoke?.('Seek', value);
    }

    ended() {
        const socket = useCastSocket();
        socket?.invoke?.('Ended');
    }

    volume(value: number) {
        const socket = useCastSocket();
        socket?.invoke?.('Volume', value);
    }

    muted(value: boolean) {
        const socket = useCastSocket();
        socket?.invoke?.('Muted', value);
    }

    item(value: PlaylistItem) {
        const socket = useCastSocket();
        socket?.invoke?.('Item', value);
    }

    playlist(value: PlaylistItem[]) {
        const socket = useCastSocket();
        socket?.invoke?.('Playlist', value);
    }

    audioTracks(value: MediaPlaylist[]) {
        const socket = useCastSocket();
        socket?.invoke?.('AudioTracks', value);
    }

    currentAudioTrack(value: number) {
        const socket = useCastSocket();
        socket?.invoke?.('CurrentAudioTrack', value);
    }

    subtitles(value: Track[]) {
        const socket = useCastSocket();
        socket?.invoke?.('SubtitleTracks', value);
    }

    currentSubtitleTrack(value: Track) {
        const socket = useCastSocket();
        socket?.invoke?.('CurrentSubtitleTrack', value);
    }

    getPlayerState() {
        const socket = useCastSocket();
        socket?.invoke?.('PlayerState', {
            time: this.player.getTimeData(),
            volume: this.player.getVolume(),
            muted: this.player.getMute(),
            playlist: this.player.getPlaylist(),
            item: this.player.getPlaylistItem(),
            isPlaying: this.player.isPlaying,
            subtitles: this.player.getCaptionsList(),
            currentSubtitleTrack: this.player.getCurrentCaptions(),
            audioTracks: this.player.getAudioTracks(),
            currentAudioTrack: this.player.getCurrentAudioTrack(),
        });
    }

    setAudioTrack(value: { audioTrack: number }) {
        this.player.setCurrentAudioTrack(value.audioTrack);
    }

    setSubtitleTrack(value: { subtitleTrack: number }) {
        this.player.setCurrentCaption(value.subtitleTrack);
    }

    setPlaylistItem(value: { item: number }) {
        this.player.playlistItem(value.item);
    }

    setSeek(value: { time: number }) {
        this.player.seek(value.time);
    }

    setVolume(value: { volume: number }) {
        this.player.setVolume(value.volume);
    }

    setPlay() {
        this.player.play().then();
    }

    setPause() {
        this.player.pause();
    }

    setNext() {
        this.player.next();
    }

    setPrevious() {
        this.player.previous();
    }

}
