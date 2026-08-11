import { NAMESPACE_GENERAL, NAMESPACE_STATUS } from './namespaces';
import { resolveServerFromAppConfig } from '@/lib/resolveServer';

/**
 * Outbound + inbound custom-namespace message bus.
 *
 * The real sender (PhoneCastSenderImpl.kt / DevicePickerDialog.kt) sends a
 * plain {route, token} JSON payload on NAMESPACE_GENERAL and waits up to 8s
 * for a {"ack":true,"route":...} echo back on the same channel before it
 * gives up (ACK_TIMEOUT_MS) - this is the ONE real handshake, not the
 * launch-customData / multi-namespace design this file previously spoke,
 * which no current sender ever populates. `token` is the phone's own live
 * Keycloak access token, used as-is (no exchange call - see
 * CastSessionAuth.kt's own doc comment on the KMP receiver for why token
 * exchange is unavailable to a public client).
 */

export interface NavigatePayload {
	route: string;
	token?: string;
}

type NavigateHandler = (payload: NavigatePayload) => void;

interface ReceiverContextLike {
	addCustomMessageListener: (
		namespace: string,
		listener: (event: { senderId?: string; data: unknown }) => void,
	) => void;
	sendCustomMessage: (
		namespace: string,
		senderId: string | undefined,
		data: unknown,
	) => void;
}

let context: ReceiverContextLike | null = null;
let lastSenderId: string | undefined;
let navigateHandlers: NavigateHandler[] = [];

function isNavigatePayload(data: unknown): data is NavigatePayload {
	return typeof data === 'object' && data !== null && typeof (data as { route?: unknown }).route === 'string';
}

export function attachMessageBus(ctx: ReceiverContextLike): void {
	context = ctx;

	ctx.addCustomMessageListener(NAMESPACE_GENERAL, (event) => {
		lastSenderId = event.senderId;
		if (!isNavigatePayload(event.data)) {
			console.debug('[cast] message on NAMESPACE_GENERAL did not parse as {route, token}', event.data);
			return;
		}
		const payload = event.data;
		try {
			ctx.sendCustomMessage(NAMESPACE_GENERAL, event.senderId, { ack: true, route: payload.route });
		}
		catch (err) {
			console.warn('[cast] ack send failed', err);
		}
		for (const fn of navigateHandlers) fn(payload);
	});
}

export function onSenderNavigate(handler: NavigateHandler): () => void {
	navigateHandlers.push(handler);
	return () => {
		navigateHandlers = navigateHandlers.filter(h => h !== handler);
	};
}

export function broadcastStatus(payload: Record<string, unknown>): void {
	if (!context || !lastSenderId)
		return;
	try {
		context.sendCustomMessage(NAMESPACE_STATUS, lastSenderId, payload);
	}
	catch (err) {
		console.warn('[cast] status broadcast failed', err);
	}
}

/** Re-exported for callers that resolve a server directly off a bare token (e.g. receiver.ts's boot path). */
export { resolveServerFromAppConfig };
