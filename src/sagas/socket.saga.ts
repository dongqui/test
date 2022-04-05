import { editNodeNameSocket } from './../actions/LP/lpNodeAction';
import { eventChannel, EventChannel } from 'redux-saga';
import { call, fork, put, take, takeLatest, ChannelTakeEffect, all } from 'redux-saga/effects';
import { io, Socket } from 'socket.io-client';
import { PayloadActionCreator } from 'typesafe-actions';

import * as socketActions from 'actions/Common/socket';
import * as lpActions from 'actions/LP/lpNodeAction';
import { execPath } from 'process';

const TEMP_SCENE_ID = 'q0j0y8dzoq9xmv7gn4n526ger3lkp1m6';
const TEMP_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwcjA4a2wybXZkOW5lN29scWoxcXozcHlyNDV4ZzZwbCIsImVtYWlsIjoiemwwNzU5dmtAbmF2ZXIuY29tIiwiand0VHlwZSI6ImxvZ2luIiwiaWF0IjoxNjQ1MTQyMzAzLCJleHAiOjE2NTAzMjYzMDN9.Ut8mlSSK6b_VZnJ9tZ0uvcsH9-zrbIMU8fRupG7OFqI';

type LibraryEventType = 'update' | 'delete' | 'move' | 'apply-mocap-to-model' | 'modify-retarget-map';
type AnimationEventType =
  | 'rename'
  | 'modify-fps'
  | 'delete'
  | 'add-layer'
  | 'rename-layer'
  | 'delete-layer'
  | 'modify-bone-track-filter'
  | 'put-frames'
  | 'move-frames'
  | 'delete-frames';

function createSocketIO(action: ReturnType<typeof socketActions.connectSocket.request>): Promise<Socket> {
  const { scendId, token } = action.payload;
  const socket = io(`wss://dev-socket-app.plask.ai/scenes?scenesId=${TEMP_SCENE_ID}&token=${TEMP_TOKEN}`, {
    transports: ['websocket'],
  });
  return new Promise((resolve) => {
    socket.connect();
    socket.on('connect', function () {
      console.log('connected');
      resolve(socket);
    });
  });
}

type LibraryEventPayload = ReturnType<typeof lpActions.deleteNodeSocket.receive | typeof lpActions.editNodeNameSocket.receive | typeof lpActions.moveNodeSocket.receive>['payload'];
function createEventChannel(socket: Socket) {
  return eventChannel((emit) => {
    const libraryEvent = (payload: LibraryEventPayload) => {
      switch (payload.type) {
        // case 'apply-mocap-to-model': {
        //   break;
        // }
        case 'delete': {
          emit(lpActions.deleteNodeSocket.receive(payload));
          break;
        }
        // case 'modify-retarget-map': {
        //   // emit(receiveFoo(payload));
        //   break;
        // }
        case 'move': {
          emit(lpActions.moveNodeSocket.receive(payload));
          break;
        }
        case 'update-name':
          emit(lpActions.editNodeNameSocket.receive(payload));
      }
    };

    const animationEvent = (payload: { type: AnimationEventType }) => {
      switch (payload.type) {
        case 'add-layer': {
          // emit(receiveFoo(payload));
          break;
        }
        case 'delete': {
          // emit(receiveFoo(payload));
          break;
        }
        case 'delete-frames': {
          // emit(receiveFoo(payload));
          break;
        }
        case 'delete-layer': {
          // emit(receiveFoo(payload));
          break;
        }
        case 'modify-bone-track-filter': {
          // emit(receiveFoo(payload));
          break;
        }
        case 'modify-fps': {
          // emit(receiveFoo(payload));
          break;
        }
        case 'move-frames': {
          // emit(receiveFoo(payload));
          break;
        }
        case 'put-frames': {
          // emit(receiveFoo(payload));
          break;
        }
        case 'rename': {
          // emit(receiveFoo(payload));
          break;
        }
        case 'rename-layer': {
          // emit(receiveFoo(payload));
          break;
        }
      }
    };

    socket.on('library', libraryEvent);
    socket.on('animation', animationEvent);
    socket.on('exception', (payload) => console.log(payload));
    return () => {
      socket.off('library', libraryEvent);
      socket.off('animation', animationEvent);
    };
  });
}

function* sendSocketEmit(socket: Socket, event: 'animation' | 'library', action: PayloadActionCreator<string, any>) {
  while (true) {
    const { payload } = yield take(action);
    socket.emit(event, payload);
  }
}

function* receiveEventChannel(socket: Socket) {
  const eventChannel: EventChannel<any> = yield call(createEventChannel, socket);
  while (true) {
    try {
      const action: ChannelTakeEffect<any> = yield take(eventChannel);
      yield put(action);
    } catch (error) {
      console.error('receiveEventChannel error=', error);
    }
  }
}

function* handleIO(socket: Socket) {
  yield all([
    receiveEventChannel(socket),

    // sendSocketEmit
    sendSocketEmit(socket, 'library', lpActions.deleteNodeSocket.send),
    sendSocketEmit(socket, 'library', lpActions.editNodeNameSocket.send),
    sendSocketEmit(socket, 'library', lpActions.moveNodeSocket.send),
  ]);
}

function* connectSocket(action: ReturnType<typeof socketActions.connectSocket.request>) {
  try {
    const socket: Socket = yield call(createSocketIO, action);
    yield fork(handleIO, socket);
  } catch (error) {
    if (error instanceof Error) {
      yield put(socketActions.connectSocket.failure(error));
    }
  }
}

function* watchConnectSocket() {
  yield takeLatest(socketActions.connectSocket.request, connectSocket);
}

export default watchConnectSocket;
