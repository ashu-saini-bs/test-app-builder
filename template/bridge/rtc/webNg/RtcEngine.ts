import {MediaDeviceInfo} from 'agora-rtc-sdk';
import AgoraRTC, {
  IAgoraRTCClient,
  ILocalAudioTrack,
  ILocalVideoTrack,
  IRemoteAudioTrack,
  IRemoteVideoTrack,
  UID,
  CameraVideoTrackInitConfig,
  ScreenVideoTrackInitConfig,
  RemoteStreamType,
  ClientConfig,
  ICameraVideoTrack,
  EncryptionMode,
  ILocalTrack,
} from 'agora-rtc-sdk-ng';
import {EncryptionConfig} from 'react-native-agora';
import type {
  RtcEngineEvents,
  Subscription,
} from 'react-native-agora/lib/typescript/src/common/RtcEvents';
import {VideoProfile} from '../quality';
//
// export interface StreamsInterface {
//     [uid: number]: AgoraRTC.Stream;
// }

type callbackType = (uid?: UID) => void;

declare global {
  interface Window {
    engine: RtcEngine;
  }
}

export declare enum RnEncryptionEnum {
  /**
   * @deprecated
   * 0: This mode is deprecated.
   */
  None = 0,
  /**
   * 1: (Default) 128-bit AES encryption, XTS mode.
   */
  AES128XTS = 1,
  /**
   * 2: 128-bit AES encryption, ECB mode.
   */
  AES128ECB = 2,
  /**
   * 3: 256-bit AES encryption, XTS mode.
   */
  AES256XTS = 3,
  /**
   * 4: 128-bit SM4 encryption, ECB mode.
   *
   * @since v3.1.2.
   */
  SM4128ECB = 4,
}

export enum VideoStreamType {
  'HIGH',
  'LOW',
}

interface LocalStream {
  audio?: ILocalAudioTrack;
  video?: ICameraVideoTrack;
}
interface ScreenStream {
  audio?: ILocalAudioTrack;
  video?: ILocalVideoTrack;
}
interface RemoteStream {
  audio?: IRemoteAudioTrack;
  video?: IRemoteVideoTrack;
}

export default class RtcEngine {
  public appId: string;
  // public AgoraRTC: any;
  public client: IAgoraRTCClient;
  public screenClient: IAgoraRTCClient;
  public eventsMap = new Map<string, callbackType>([
    ['UserJoined', () => null],
    ['UserOffline', () => null],
    ['JoinChannelSuccess', () => null],
    ['ScreenshareStopped', () => null],
    ['RemoteAudioStateChanged', () => null],
    ['RemoteVideoStateChanged', () => null],
  ]);
  public localStream: LocalStream = {};
  public screenStream: ScreenStream = {};
  public remoteStreams = new Map<UID, RemoteStream>();
  // public streamSpec: AgoraRTC.StreamSpec;
  // public streamSpecScreenshare: ScreenVideoTrackInitConfig;
  private inScreenshare: Boolean = false;
  // private removeStream = (uid: UID) => {

  // };
  private videoProfile: VideoProfile = '480p_9';
  private isPublished = false;
  private isAudioEnabled = true;
  private isVideoEnabled = true;
  private isAudioPublished = false;
  private isVideoPublished = false;

  constructor(appId: string) {
    this.appId = appId;
    // this.AgoraRTC = AgoraRTC;
    this.client = AgoraRTC.createClient({
      codec: 'vp8',
      mode: 'rtc',
    });
    this.screenClient = AgoraRTC.createClient({
      codec: 'vp8',
      mode: 'rtc',
    });
    // this.streamSpec = {
    //   video: true,
    //   audio: true,
    // };
    // this.streamSpecScreenshare = {
    //   audio: false,
    //   video: false,
    //   screen: true,
    //   screenAudio: true,
    // };
  }
  static async create(appId: string): Promise<RtcEngine> {
    let engine = new RtcEngine(appId);
    window.engine = engine;
    // let init = new Promise((resolve, reject) => {
    //   engine.client.init(
    //     appId,
    //     function () {
    //       window.engine = engine;
    //       resolve();
    //     },
    //     function (err) {
    //       console.error(err);
    //       reject();
    //     },
    //   );
    // });
    // await init;
    return engine;
  }

  async setVideoProfile(profile: VideoProfile): Promise<void> {
    this.videoProfile = profile;
  }

  async enableVideo(): Promise<void> {
    try {
      let [
        localAudio,
        localVideo,
      ] = await AgoraRTC.createMicrophoneAndCameraTracks(
        {},
        {encoderConfig: this.videoProfile},
      );
      // localVideo.setEncoderConfiguration(this.videoProfile);
      this.localStream.audio = localAudio;
      this.localStream.video = localVideo;
    } catch (e) {
      throw e;
    }
    // let enable = new Promise((resolve, reject) => {
    //   this.streams.set(0, );
    //   (this.streams.get(0) as AgoraRTC.Stream).setVideoProfile(
    //     this.videoProfile,
    //   );
    //   (this.streams.get(0) as AgoraRTC.Stream).init(() => {
    //     resolve();
    //   }, reject);
    // });
    // await enable;
  }
  async publish() {
    if (this.localStream.audio && this.localStream.video) {
      try {
        let tracks: Array<ILocalTrack> = [];
        this.isAudioEnabled && tracks.push(this.localStream.audio);
        this.isVideoEnabled && tracks.push(this.localStream.video);

        if (tracks.length > 0) {
          console.log('publishing now');
          await this.client.publish(tracks);
          if (tracks[0].trackMediaType === 'audio') {
            this.isAudioPublished = true;
          } else if (tracks[0].trackMediaType === 'video') {
            this.isVideoPublished = true;
          }

          if (tracks[1]?.trackMediaType === 'audio') {
            this.isAudioPublished = true;
          } else if (tracks[1]?.trackMediaType === 'video') {
            this.isVideoPublished = true;
          }

          if (this.isPublished === false) {
            this.isPublished = true;
            (this.eventsMap.get('JoinChannelSuccess') as callbackType)();
          }
        }
      } catch (e) {
        console.error(e, this.localStream);
        this.isPublished = false;
      }
    }
  }

  async joinChannel(
    token: string,
    channelName: string,
    optionalInfo: string,
    optionalUid: number,
  ): Promise<void> {
    // let self = this;
    // let join = new Promise<void>((resolve, reject) => {
    // this.client.on('stream-added', (evt) => {
    //   this.inScreenshare
    //     ? evt.stream.getId() !== this.streams.get(1).getId()
    //       ? this.client.subscribe(evt.stream)
    //       : (this.eventsMap.get('UserJoined') as callbackType)(1)
    //     : this.client.subscribe(evt.stream);
    // });
    // this.client.on('stream-subscribed', (evt) => {
    //   this.streams.set(evt.stream.getId(), evt.stream);
    //   (this.eventsMap.get('UserJoined') as callbackType)(evt.stream.getId());
    // });
    // this.client.on('stream-removed', (evt) => {
    //   console.log('triggered');
    //   this.removeStream(evt);
    // });
    // this.client.on('peer-leave', (evt) => {
    //   console.log('triggered');
    //   this.removeStream(evt);
    // });

    this.client.on('user-joined', (user) => {
      const uid = this.inScreenshare
        ? user.uid !== this.screenClient.uid
          ? user.uid
          : 1
        : user.uid;
      (this.eventsMap.get('UserJoined') as callbackType)(uid);
      (this.eventsMap.get('RemoteVideoStateChanged') as callbackType)(
        uid,
        0,
        0,
        0,
      );
      (this.eventsMap.get('RemoteAudioStateChanged') as callbackType)(
        uid,
        0,
        0,
        0,
      );
    });

    this.client.on('user-left', (user) => {
      const uid = this.inScreenshare
        ? user.uid !== this.screenClient.uid
          ? user.uid
          : 1
        : user.uid;

      // if (uid ===1) {
      //   this.screenStream.audio?.close();
      //   this.screenStream.video?.close();
      //   this.screenStream = {}
      // }
      // else
      if (this.remoteStreams.has(uid)) {
        this.remoteStreams.delete(uid);
      }
      (this.eventsMap.get('UserOffline') as callbackType)(uid);
      // (this.eventsMap.get('UserJoined') as callbackType)(uid);
    });
    this.client.on('user-published', async (user, mediaType) => {
      // Initiate the subscription
      if (this.inScreenshare && user.uid === this.screenClient.uid) {
        (this.eventsMap.get('RemoteVideoStateChanged') as callbackType)(
          1,
          2,
          0,
          0,
        );
      } else {
        await this.client.subscribe(user, mediaType);
      }

      // If the subscribed track is an audio track
      if (mediaType === 'audio') {
        const audioTrack = user.audioTrack;
        // Play the audio
        audioTrack?.play();
        this.remoteStreams.set(user.uid, {
          ...this.remoteStreams.get(user.uid),
          audio: audioTrack,
        });
        (this.eventsMap.get('RemoteAudioStateChanged') as callbackType)(
          user.uid,
          2,
          0,
          0,
        );
      } else {
        const videoTrack = user.videoTrack;
        // Play the video
        // videoTrack.play(DOM_ELEMENT);
        this.remoteStreams.set(user.uid, {
          ...this.remoteStreams.get(user.uid),
          video: videoTrack,
        });
        (this.eventsMap.get('RemoteVideoStateChanged') as callbackType)(
          user.uid,
          2,
          0,
          0,
        );
      }
    });
    this.client.on('user-unpublished', async (user, mediaType) => {
      if (mediaType === 'audio') {
        const {audio, ...rest} = this.remoteStreams.get(user.uid);
        this.remoteStreams.set(user.uid, rest);
        (this.eventsMap.get('RemoteAudioStateChanged') as callbackType)(
          user.uid,
          0,
          0,
          0,
        );
      } else {
        const {video, ...rest} = this.remoteStreams.get(user.uid);
        this.remoteStreams.set(user.uid, rest);
        (this.eventsMap.get('RemoteVideoStateChanged') as callbackType)(
          user.uid,
          0,
          0,
          0,
        );
      }
    });

    // this.client.on('stream-fallback', (evt))
    this.client.on('stream-type-changed', function (uid, streamType) {
      console.log('[fallback]: ', uid, streamType);
    });
    // this.client.on('stream-published', (evt) => {
    //   (this.eventsMap.get('JoinChannelSuccess') as callbackType)();
    // });
    // this.client.on('mute-audio', (evt) => {
    //   (this.eventsMap.get('RemoteAudioStateChanged') as callbackType)(
    //     evt.uid,
    //     0,
    //     0,
    //     0,
    //   );
    // });
    // this.client.on('unmute-audio', (evt) => {
    //   (this.eventsMap.get('RemoteAudioStateChanged') as callbackType)(
    //     evt.uid,
    //     2,
    //     0,
    //     0,
    //   );
    // });
    // this.client.on('mute-video', (evt) => {
    //   (this.eventsMap.get('RemoteVideoStateChanged') as callbackType)(
    //     evt.uid,
    //     0,
    //     0,
    //     0,
    //   );
    // });
    // this.client.on('unmute-video', (evt) => {
    //   (this.eventsMap.get('RemoteVideoStateChanged') as callbackType)(
    //     evt.uid,
    //     2,
    //     0,
    //     0,
    //   );
    // });
    // });
    // await join;
    await this.client.join(
      this.appId,
      channelName,
      token || null,
      optionalUid || null,
    );
    await this.publish();
  }

  async leaveChannel(): Promise<void> {
    this.client.leave();
    this.remoteStreams.forEach((stream, uid, map) => {
      stream.video?.close();
      stream.audio?.close();
    });
    this.remoteStreams.clear();
  }

  addListener<EventType extends keyof RtcEngineEvents>(
    event: EventType,
    listener: RtcEngineEvents[EventType],
  ): Subscription {
    if (
      event === 'UserJoined' ||
      event === 'UserOffline' ||
      event === 'JoinChannelSuccess' ||
      event === 'ScreenshareStopped' ||
      event === 'RemoteAudioStateChanged' ||
      event === 'RemoteVideoStateChanged'
    ) {
      this.eventsMap.set(event, listener as callbackType);
    }
    return {
      remove: () => {
        console.log(
          'Use destroy method to remove all the event listeners from the RtcEngine instead.',
        );
      },
    };
  }

  async muteLocalAudioStream(muted: boolean): Promise<void> {
    try {
      await this.localStream.audio?.setEnabled(!muted);
      this.isAudioEnabled = !muted;
      if (!muted && !this.isAudioPublished) {
        await this.publish();
      }
    } catch (e) {
      console.error(
        e,
        '\n Be sure to invoke the enableVideo method before using this method.',
      );
    }
  }

  async muteLocalVideoStream(muted: boolean): Promise<void> {
    try {
      await this.localStream.video?.setEnabled(!muted);
      this.isVideoEnabled = !muted;
      if (!muted && !this.isVideoPublished) {
        await this.publish();
      }
    } catch (e) {
      console.error(
        e,
        '\n Be sure to invoke the enableVideo method before using this method.',
      );
    }
  }

  async muteRemoteAudioStream(uid: number, muted: boolean): Promise<void> {
    try {
      this.remoteStreams.get(uid)?.audio?.setEnabled(!muted);
    } catch (e) {
      console.error(e);
    }
  }

  async muteRemoteVideoStream(uid: number, muted: boolean): Promise<void> {
    try {
      this.remoteStreams.get(uid)?.video?.setEnabled(!muted);
    } catch (e) {
      console.error(e);
    }
  }

  async getDevices(
    callback: (devices: Array<MediaDeviceInfo>) => void,
  ): Promise<Array<MediaDeviceInfo>> {
    const devices: Array<MediaDeviceInfo> = await AgoraRTC.getDevices(true);
    callback && callback(devices);
    return devices;
  }

  async changeCamera(cameraId, callback, error): Promise<void> {
    try {
      await this.localStream.video?.setDevice(cameraId);
      callback(cameraId);
    } catch (e) {
      error(e);
    }
  }

  async changeMic(micId, callback, error) {
    try {
      await this.localStream.audio?.setDevice(micId);
      callback(micId);
    } catch (e) {
      error(e);
    }
  }

  async enableDualStreamMode(enable: boolean) {
    return this.client[enable ? 'enableDualStream' : 'disableDualStream']();
    // enable
    //   ? this.client.enableDualStream(
    //       () => {
    //         console.log('[bridge]: dual stream is enabled');
    //         Promise.resolve(null);
    //       },
    //       (e) => {
    //         console.log('[bridge]: dual stream not enabled', e);
    //         Promise.reject('error in enable dual stream');
    //       },
    //     )
    //   : this.client.disableDualStream(
    //       () => Promise.resolve(null),
    //       () => Promise.reject('error in disable dual stream'),
    //     );
  }

  // Bug in implementation !!!
  async setRemoteSubscribeFallbackOption(option: 0 | 1 | 2) {
    this.streams.forEach((stream) => {
      this.client.setStreamFallbackOption(stream, option);
    });
    Promise.resolve();
    console.log('!set fallback');
  }

  async enableEncryption(
    enabled: boolean,
    config: {
      encryptionMode: RnEncryptionEnum;
    },
  ): Promise<void> {
    let mode: EncryptionMode;
    if (enabled) {
      switch (config.encryptionMode) {
        case RnEncryptionEnum.None:
          mode = 'none';
          break;
        case RnEncryptionEnum.AES128ECB:
          mode = 'aes-128-ecb';
          break;
        case RnEncryptionEnum.AES128XTS:
          mode = 'aes-128-xts';
          break;
        case RnEncryptionEnum.AES256XTS:
          mode = 'aes-256-xts';
          break;
        case RnEncryptionEnum.SM4128ECB:
          mode = 'sm4-128-ecb';
      }
    } else {
      mode = 'none';
    }

    try {
      await Promise.all([
        this.client.setEncryptionConfig(mode, config.encryptionKey),
        this.screenClient.setEncryptionConfig(mode, config.encryptionKey),
      ]);
    } catch (e) {
      throw e;
    }
  }

  /**
   * @deprecated
   * @param encryptionMode
   */
  setEncryptionSecret(secret: string) {
    // this.client.setEncryptionSecret(secret);
    console.error('Please use enableEncryption instead');
  }

  /**
   * @deprecated
   * @param encryptionMode
   */
  setEncryptionMode(
    encryptionMode: 'aes-128-xts' | 'aes-256-xts' | 'aes-128-ecb',
  ) {
    // this.client.setEncryptionMode(encryptionMode);
    console.error('Please use enableEncryption instead');
  }

  async destroy(): Promise<void> {
    if (this.inScreenshare) {
      (this.eventsMap.get('UserOffline') as callbackType)(1);
      this.screenClient.leave();
      (this.eventsMap.get('ScreenshareStopped') as callbackType)();
    }
    this.eventsMap.forEach((callback, event, map) => {
      this.client.off(event, callback);
    });
    this.eventsMap.clear();
    if (this.remoteStreams.size !== 0) {
      this.remoteStreams.forEach((stream, uid, map) => {
        stream?.video?.isPlaying && stream?.video?.stop();
        stream?.video?.isPlaying && stream?.audio?.stop();
      });
      this.remoteStreams.clear();
    }
    this.localStream.audio?.close();
    this.localStream.video?.close();
    this.localStream = {};
    this.screenStream.audio?.close();
    this.screenStream.video?.close();
    this.screenStream = {};
  }

  async setRemoteVideoStreamType(
    uid: number,
    streamType: VideoStreamType,
  ): Promise<void> {
    return this.client.setRemoteVideoStreamType(
      uid,
      (streamType as unknown) as RemoteStreamType,
    );
  }

  isSingleTrack(
    x: ILocalVideoTrack | [ILocalVideoTrack, ILocalAudioTrack],
  ): x is ILocalVideoTrack {
    if ((x as [ILocalVideoTrack, ILocalAudioTrack]).length) {
      return false;
    } else {
      return true;
    }
  }

  async startScreenshare(
    token: string,
    channelName: string,
    optionalInfo: string,
    optionalUid: number,
    appId: string,
    engine: AgoraRTC,
    encryption: {
      screenKey: string;
      mode: 'aes-128-xts' | 'aes-256-xts' | 'aes-128-ecb';
    },
    config: ScreenVideoTrackInitConfig = {},
    audio: 'enable' | 'disable' | 'auto' = 'auto',
  ): Promise<void> {
    if (!this.inScreenshare) {
      // let init = new Promise((resolve, reject) => {
      //   engine.screenClient.init(
      //     appId,
      //     function () {
      //       resolve();
      //     },
      //     function (err) {
      //       console.error(err);
      //       reject();
      //     },
      //   );
      // });
      // await init;
      try {
        // let enable = new Promise((resolve, reject) => {
        // try {
        //   console.log('[screenshare]: creating stream');
        //   this.streams.set(
        //     1,
        //     AgoraRTC.createStream(this.streamSpecScreenshare),
        //   );
        // } catch (e) {
        //   console.error("[screenshare]: Couldn't createStream", e);
        // }
        // console.log('[screenshare]: Initalizing stream');
        // (this.streams.get(1) as AgoraRTC.Stream).init(() => {
        //   console.log('[screenshare]: initalized stream');
        //   resolve();
        // }, reject);

        // });
        // await enable;
        console.log('[screenshare]: creating stream');
        const screenTracks = await AgoraRTC.createScreenVideoTrack(
          config,
          audio,
        );
        if (this.isSingleTrack(screenTracks)) {
          this.screenStream.video = screenTracks;
        } else {
          this.screenStream.video = screenTracks[0];
          this.screenStream.audio = screenTracks[1];
        }
      } catch (e) {
        console.log('[screenshare]: Error during intialization');
        throw e;
      }

      // let join = new Promise((resolve, reject) => {
      //   if (encryption && encryption.screenKey && encryption.mode) {
      //     this.screenClient.setEncryptionSecret(encryption.screenKey);
      //     this.screenClient.setEncryptionMode(encryption.mode);
      //   }

      // });
      // await join;
      await this.screenClient.join(
        this.appId,
        channelName,
        token || null,
        optionalUid || null,
      );
      // this.localScreenUid = uid as number;
      this.inScreenshare = true;
      await this.screenClient.publish(
        this.screenStream.audio
          ? [this.screenStream.video, this.screenStream.audio]
          : this.screenStream.video,
      );

      this.screenStream.video.on('track-ended', () => {
        (this.eventsMap.get('UserOffline') as callbackType)(1);
        // (this.streams.get(1) as AgoraRTC.Stream).close();
        this.screenClient.leave();

        this.screenStream.audio?.close();
        this.screenStream.video?.close();
        this.screenStream = {};

        (this.eventsMap.get('ScreenshareStopped') as callbackType)();
        this.inScreenshare = false;
      });
    } else {
      (this.eventsMap.get('UserOffline') as callbackType)(1);
      this.screenClient.leave();
      (this.eventsMap.get('ScreenshareStopped') as callbackType)();
      try {
        this.screenStream.audio?.close();
        this.screenStream.video?.close();
        this.screenStream = {};
      } catch (err) {
        throw err;
      }
      this.inScreenshare = false;
    }
  }
}
