/**
 * SignalR event payload types per spec §9.2-§9.4. Mirror authoritative
 * server-side shapes from NoMercy.Api/Services/{Music,Video}/* and
 * NoMercy.Api/Hubs/*. Receiver-side narrow definitions — only fields the
 * receiver consumes.
 */

export interface VideoPlayerStateMsg {
	device_id?: string;
	current_item?: {
		id: number;
		title: string;
		duration?: string;
		progress?: { time?: number; total?: number };
	};
	current_list?: string;
	play_state?: boolean;
	time?: number;
	duration?: number;
	volume_percentage?: number;
	actions?: { disallows?: Record<string, boolean> };
}

export interface MusicPlayerStateMsg {
	device_id?: string;
	current_item?: {
		id: string;
		name: string;
		artist?: string;
		cover?: string;
		duration?: string;
	};
	current_list?: string;
	play_state?: boolean;
	time?: number;
	duration?: number;
	playlist?: unknown[];
	backlog?: unknown[];
	volume_percentage?: number;
	actions?: { disallows?: Record<string, boolean> };
}

export interface DeviceListItemMsg {
	id: string;
	device_id: string;
	name?: string;
	type?: string;
	ip?: string;
	is_online?: boolean;
	is_foreground?: boolean;
	screen_on?: boolean;
}

export interface BroadcastEventPayloadMsg {
	events: Array<{
		device_broadcast_status?: {
			timestamp: number;
			broadcast_status: string;
			device_id: string;
		};
	}>;
}

export type RefreshLibraryPayload = readonly string[];
