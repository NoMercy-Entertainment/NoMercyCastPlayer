import Plugin from '@nomercy-entertainment/nomercy-video-player/src/plugin';
import type {NMPlayer, PlaylistItem, TimeData, Track} from "@nomercy-entertainment/nomercy-video-player/src/types";
import {useCastSocket} from "@/store/socket";
import {initializeCastSocket} from "@/lib/socketClient/initializeSocket";
import {MediaPlaylist} from "hls.js";

export class CastSyncPlugin extends Plugin {
	player: NMPlayer = <NMPlayer<{
		basePath: string,
		accessToken: string,
	}>>{};

	async initialize(player: NMPlayer<{
		basePath: string,
		accessToken: string,
	}>) {
		this.player = player;

		await initializeCastSocket(player.options.basePath, player.options.accessToken);
	}

	use() {
		this.player.on('time', this.time);
		this.player.on('play', this.play);
		this.player.on('pause', this.pause);
		this.player.on('stop', this.stop);
		this.player.on('seek', this.seek);
		this.player.on('ended', this.ended);
		this.player.on('item', this.item);
		this.player.on('volume', this.volume);
		this.player.on('muted', this.muted);
		this.player.on('playlist', this.playlist);
		this.player.on('audioTracks', this.audioTracks);
		this.player.on('currentAudioTrack', this.currentAudioTrack);
		this.player.on('subtitles', this.subtitles);
		this.player.on('currentSubtitleTrack', this.currentSubtitleTrack);
		this.player.on('lastTimeTrigger', this.getPlayerState);

		const socket = useCastSocket();
		socket?.on('GetPlayerState', this.getPlayerState);
	}

	dispose() {
		// @ts-ignore
		this.player.off('time', this.time);
		this.player.off('play', this.play);
		this.player.off('pause', this.pause);
		this.player.off('stop', this.stop);
		// @ts-ignore
		this.player.off('seek', this.seek);
		this.player.off('ended', this.ended);
		// @ts-ignore
		this.player.off('item', this.item);
		// @ts-ignore
		this.player.off('volume', this.volume);
		// @ts-ignore
		this.player.off('muted', this.muted);
		// @ts-ignore
		this.player.off('playlist', this.playlist);
		// @ts-ignore
		this.player.off('audioTracks', this.audioTracks);
		// @ts-ignore
		this.player.off('currentAudioTrack', this.currentAudioTrack);
		// @ts-ignore
		this.player.off('subtitles', this.subtitles);
		// @ts-ignore
		this.player.off('currentSubtitleTrack', this.currentSubtitleTrack);
		// @ts-ignore
		this.player.off('lastTimeTrigger', this.getPlayerState);

		const socket = useCastSocket();
		socket?.off('GetPlayerState', this.getPlayerState);
	}


	play() {
		const socket = useCastSocket();
		socket?.invoke?.('Play', 'receiver');
	}

	pause() {
		const socket = useCastSocket();
		socket?.invoke?.('Pause', 'receiver');
	}

	stop() {
		const socket = useCastSocket();
		socket?.invoke?.('Stop', 'receiver');
	}

	time(data: TimeData){
		const socket = useCastSocket();
		socket?.invoke?.('Time', 'receiver', data);
	}

	seek(value: number) {
		const socket = useCastSocket();
		socket?.invoke?.('Seek', 'receiver', value);
	}

	ended(){
		const socket = useCastSocket();
		socket?.invoke?.('Ended', 'receiver');
	}

	volume(value: number) {
		const socket = useCastSocket();
		socket?.invoke?.('Volume', 'receiver', value);
	}

	muted(value: boolean) {
		const socket = useCastSocket();
		socket?.invoke?.('Muted', 'receiver', value);
	}

	item(value: PlaylistItem) {
		const socket = useCastSocket();
		socket?.invoke?.('Item', 'receiver', value);
	}

	playlist(value: PlaylistItem[]) {
		const socket = useCastSocket();
		socket?.invoke?.('Playlist', 'receiver', value);
	}

	audioTracks(value: MediaPlaylist[]) {
		const socket = useCastSocket();
		socket?.invoke?.('AudioTracks', 'receiver', value);
	}

	currentAudioTrack(value: number) {
		const socket = useCastSocket();
		socket?.invoke?.('CurrentAudioTrack', 'receiver', value);
	}

	subtitles(value: Track[]) {
		const socket = useCastSocket();
		socket?.invoke?.('Subtitles', 'receiver', value);
	}

	currentSubtitleTrack(value: Track) {
		const socket = useCastSocket();
		socket?.invoke?.('CurrentSubtitleTrack', 'receiver', value);
	}

	getPlayerState() {
		const socket = useCastSocket();
		socket?.invoke?.('PlayerState', 'receiver', {
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

}
