import {computed, ref, toRaw} from 'vue';

import SocketClient from '@/lib/socketClient/SocketClient';
import {HubConnection} from '@microsoft/signalr';

const si = ref<SocketClient>(<SocketClient>{});
export const socketInstance = computed(() => si.value);
export const setSocketInstance = (value: SocketClient) => {
	si.value = value;
}

export const useSocket = () => {
	return toRaw(si.value.connection) as HubConnection
};
