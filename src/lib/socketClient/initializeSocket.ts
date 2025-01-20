import {watch} from 'vue';

import SocketClient from './SocketClient';
import {setSocketInstance, socketInstance} from '@/store/socket';

const initializeSocket = async (url: string, accessToken: string): Promise<void> => {
	socketInstance.value?.dispose();

	const socket = new SocketClient(url, accessToken);
	await socket.setup();
	setSocketInstance(socket);
}

export default initializeSocket;

