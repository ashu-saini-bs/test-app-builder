import React, {useEffect} from 'react';
import {StyleProp, StyleSheet, ViewProps, ViewStyle} from 'react-native';
import {VideoMirrorMode, VideoRenderMode} from 'react-native-agora/lib/Types';

export interface RtcSurfaceViewProps extends ViewProps {
  zOrderMediaOverlay?: boolean;
  zOrderOnTop?: boolean;
  renderMode?: VideoRenderMode;
  channelId?: string;
  mirrorMode?: VideoMirrorMode;
}
export interface RtcUidProps {
  uid: number;
}
export interface StyleProps {
  style?: StyleProp<ViewStyle>;
}

interface SurfaceViewInterface
  extends RtcSurfaceViewProps,
    RtcUidProps,
    StyleProps {}

const SurfaceView = (props: SurfaceViewInterface) => {
  console.log('Surface View props', props);
  useEffect(
    function () {
      const stream: AgoraRTC.Stream = window.engine.streams.get(props.uid);
      if (props.renderMode == 2) {
        stream.play(String(props.uid), {fit: 'contain'});
      } else {
        stream.play(String(props.uid));
      }
      // document.getElementById(props.uid).children[0].style.borderRadius = props.style?.borderRadius + "px";
      return () => {
        console.log(`unmounting stream ${props.uid}`, stream);
        stream.stop();
      };
    },
    [props.uid, props.renderMode],
  );

  return (
    <div
      id={String(props.uid)}
      className={'video-container'}
      style={{
        flex: 1,
        borderRadius: props.style?.borderRadius,
        overflow: 'hidden',
        ...(props.style as Object),
      }}
    />
  );
};

export default SurfaceView;
