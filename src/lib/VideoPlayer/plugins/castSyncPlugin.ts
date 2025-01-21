import Plugin from '@nomercy-entertainment/nomercy-video-player/src/plugin';
import type {NMPlayer, PlaylistItem, TimeData} from "@nomercy-entertainment/nomercy-video-player/src/types";
import {useCastSocket} from "@/store/socket";
import {initializeCastSocket} from "@/lib/socketClient/initializeSocket";

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

		const socket = useCastSocket();
		socket?.on('GetPlayerState', this.getPlayerState.bind(this));
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

		const socket = useCastSocket();
		socket?.off('GetPlayerState', this.getPlayerState.bind(this));
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
