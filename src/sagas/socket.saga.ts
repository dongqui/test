import { editKeyframesSocket, moveKeyframesSocket } from './../actions/keyframes';
import { eventChannel, EventChannel } from 'redux-saga';
import { call, fork, put, take, takeLatest, ChannelTakeEffect, all } from 'redux-saga/effects';
import { io, Socket } from 'socket.io-client';
import { PayloadActionCreator } from 'typesafe-actions';

import * as socketActions from 'actions/Common/socket';
import * as lpActions from 'actions/LP/lpNodeAction';
import * as trackListActions from 'actions/trackList';
import * as keyFrameActions from 'actions/keyframes';

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
  const { sceneId, token } = action.payload;
  const socket = io(`${process.env.NEXT_PUBLIC_BACKEND_WEB_SOCKET_URL}/scenes?scenesId=${sceneId}&token=${token}`, {
    transports: ['websocket'],
  });
  return new Promise((resolve) => {
    socket.connect();
    socket.on('connect', function () {
      console.log('connected');
      resolve(socket);
    });

    // For test
    // socket.onAny(function (...ars) {
    //   console.log(ars);
    // });
  });
}

type LibraryEventPayload = ReturnType<typeof lpActions.deleteNodeSocket.receive | typeof lpActions.editNodeNameSocket.receive | typeof lpActions.moveNodeSocket.receive>['payload'];
type AnimationEventPayload = ReturnType<
  | typeof trackListActions.addLayerSocket.receive
  | typeof trackListActions.deleteLayerSocket.receive
  | typeof keyFrameActions.deleteKeyframesSocket.receive
  | typeof keyFrameActions.editKeyframesSocket.receive
>['payload'];
function createEventChannel(socket: Socket) {
  return eventChannel((emit) => {
    const libraryEvent = (payload: LibraryEventPayload) => {
      switch (payload.type) {
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

    const animationEvent = (payload: AnimationEventPayload) => {
      switch (payload.type) {
        case 'add-layer': {
          emit(trackListActions.addLayerSocket.receive(payload));
          break;
        }
        case 'delete-layer': {
          emit(trackListActions.deleteLayerSocket.receive(payload));
          break;
        }
        // case 'delete': {
        //   // emit(receiveFoo(payload));
        //   break;
        // }
        case 'delete-frames': {
          emit(keyFrameActions.deleteKeyframesSocket.receive(payload));
          break;
        }

        // case 'modify-bone-track-filter': {
        //   // emit(receiveFoo(payload));
        //   break;
        // }
        // case 'modify-fps': {
        //   // emit(receiveFoo(payload));
        //   break;
        // }
        // case 'move-frames': {
        //   // emit(receiveFoo(payload));
        //   break;
        // }
        case 'put-frames': {
          // emit(receiveFoo(payload));
          emit(keyFrameActions.editKeyframesSocket.receive(payload));
          break;
        }
        // case 'rename': {
        //   // emit(receiveFoo(payload));
        //   break;
        // }
        // case 'rename-layer': {
        //   // emit(receiveFoo(payload));
        //   break;
        // }
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
  console.log(event);
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
    sendSocketEmit(socket, 'animation', trackListActions.addLayerSocket.send),
    sendSocketEmit(socket, 'animation', trackListActions.deleteLayerSocket.send),
    sendSocketEmit(socket, 'animation', keyFrameActions.deleteKeyframesSocket.send),
    sendSocketEmit(socket, 'animation', keyFrameActions.editKeyframesSocket.send),
    sendSocketEmit(socket, 'animation', keyFrameActions.moveKeyframesSocket.send),
    sendSocketEmit(socket, 'animation', keyFrameActions.pasteKeyframesSocket.send),
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
