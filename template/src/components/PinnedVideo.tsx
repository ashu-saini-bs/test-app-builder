import React, {useState, useContext} from 'react';
import {
  ScrollView,
  View,
  Dimensions,
  StyleSheet,
  Platform,
  Text,
  Image,
  Pressable,
} from 'react-native';
import {MinUidConsumer} from '../../agora-rn-uikit/src/MinUidContext';
import RtcContext from '../../agora-rn-uikit/src/RtcContext';
import {MaxVideoView} from '../../agora-rn-uikit/Components';
import {MaxUidConsumer} from '../../agora-rn-uikit/src/MaxUidContext';
import chatContext from './ChatContext';
import ColorContext from './ColorContext';
import icons from '../assets/icons';
import {layoutProps} from '../../theme.json';
import FallbackLogo from '../subComponents/FallbackLogo';

const {topPinned} = layoutProps;

const PinnedVideo = () => {
  const {primaryColor} = useContext(ColorContext);
  const [collapse, setCollapse] = useState(false);
  const [dim, setDim] = useState([
    Dimensions.get('window').width,
    Dimensions.get('window').height,
    Dimensions.get('window').width > Dimensions.get('window').height,
  ]);
  let onLayout = () => {
    setTimeout(() => {
      let {height, width} = Dimensions.get('window');
      let isLandscape = width > height;
      setDim([width, height, isLandscape]);
    }, 20);
  };
  const isSidePinnedlayout = topPinned === true ? false : dim[2]; // if either explicity set to false or auto evaluation
  const {userList, localUid} = useContext(chatContext);
  return (
    <View
      style={{
        flexDirection: isSidePinnedlayout ? 'row' : 'column',
        flex: 1,
        padding: 4,
      }}
      onLayout={onLayout}>
      {isSidePinnedlayout && (
        <Pressable
          onPress={() => setCollapse(!collapse)}
          style={{
            position: 'absolute',
            zIndex: 50,
            marginTop: 5,
            width: 35,
            height: 35,
            marginLeft: collapse ? 5 : '20.1%',
            backgroundColor: $config.secondaryFontColor + 'aa',
            borderRadius: 50,
            justifyContent: 'center',
          }}>
          {/* <Image
            source={{
              uri: icons.micOff,
            }}
            style={[style.MicIcon]}
            resizeMode={'contain'}
          /> */}
          <Text
            style={{
              alignSelf: 'center',
              justifyContent: 'center',
              color: $config.primaryColor,
              fontWeight: '500',
              fontSize: 20,
            }}>
            {collapse ? '>' : '<'}
          </Text>
        </Pressable>
      )}
      {!collapse && (
        <ScrollView
          horizontal={!isSidePinnedlayout}
          decelerationRate={0}
          // snapToInterval={
          //   dim[2] ? dim[0] * 0.1125 + 2 : ((dim[1] / 3.6) * 16) / 9
          // }
          // snapToAlignment={'center'}
          style={
            isSidePinnedlayout
              ? {width: '20%', paddingHorizontal: 8}
              : {flex: 1}
          }>
          <RtcContext.Consumer>
            {(data) => (
              <MinUidConsumer>
                {(minUsers) =>
                  minUsers.map((user) => (
                    <Pressable
                      style={
                        isSidePinnedlayout
                          ? {
                              width: '100%',
                              height: dim[0] * 0.1125 + 2, // width * 20/100 * 9/16 + 2
                              zIndex: 40,
                            }
                          : {
                              width: ((dim[1] / 3) * 16) / 9 / 2 + 12, //dim[1] /4.3
                              height: '100%',
                              zIndex: 40,
                              paddingHorizontal: 20,
                              paddingVertical: 5,
                            }
                      }
                      key={user.uid}
                      onPress={() => {
                        data.dispatch({type: 'SwapVideo', value: [user]});
                      }}>
                      <View style={style.flex1}>
                        <MaxVideoView
                          fallback={() => {
                            if (user.uid === 'local') {
                              return FallbackLogo(userList[localUid]?.name);
                            } else {
                              return FallbackLogo(userList[user.uid]?.name);
                            }
                          }}
                          user={user}
                          key={user.uid}
                        />
                        <View style={style.nameHolder}>
                          <View style={[style.MicBackdrop]}>
                            <Image
                              source={{
                                uri: user.audio ? icons.mic : icons.micOff,
                              }}
                              style={[
                                style.MicIcon,
                                {
                                  tintColor: user.audio ? primaryColor : 'red',
                                },
                              ]}
                              resizeMode={'contain'}
                            />
                          </View>
                          <Text style={style.name}>
                            {user.uid === 'local'
                              ? userList[localUid]
                                ? userList[localUid].name + ' '
                                : 'You '
                              : userList[user.uid]
                              ? userList[user.uid].name + ' '
                              : user.uid === 1
                              ? userList[localUid].name + "'s screenshare "
                              : 'User '}
                          </Text>
                        </View>
                      </View>
                    </Pressable>
                  ))
                }
              </MinUidConsumer>
            )}
          </RtcContext.Consumer>
        </ScrollView>
      )}
      <View
        style={
          isSidePinnedlayout
            ? collapse
              ? style.width100
              : style.width80
            : style.flex4
        }>
        <MaxUidConsumer>
          {(maxUsers) => (
            <View style={style.flex1}>
              <MaxVideoView
                fallback={() => {
                  if (maxUsers[0].uid === 'local') {
                    return FallbackLogo(userList[localUid]?.name);
                  } else {
                    return FallbackLogo(userList[maxUsers[0].uid]?.name);
                  }
                }}
                user={maxUsers[0]}
                key={maxUsers[0].uid}
              />
              <View style={style.nameHolder}>
                <View style={[style.MicBackdrop]}>
                  <Image
                    source={{
                      uri: maxUsers[0].audio ? icons.mic : icons.micOff,
                    }}
                    style={[
                      style.MicIcon,
                      {
                        tintColor: maxUsers[0].audio ? primaryColor : 'red',
                      },
                    ]}
                    resizeMode={'contain'}
                  />
                </View>
                <Text style={style.name}>
                  {maxUsers[0].uid === 'local'
                    ? userList[localUid]
                      ? userList[localUid].name + ' '
                      : 'You '
                    : userList[maxUsers[0].uid]
                    ? userList[maxUsers[0].uid].name + ' '
                    : maxUsers[0].uid === 1
                    ? userList[localUid].name + "'s screenshare "
                    : 'User '}
                </Text>
              </View>
            </View>
          )}
        </MaxUidConsumer>
      </View>
    </View>
  );
};

const style = StyleSheet.create({
  width80: {width: '80%'},
  width100: {width: '100%'},
  flex2: {flex: 2},
  flex4: {flex: 4},
  flex1: {flex: 1},
  nameHolder: {
    marginTop: -25,
    backgroundColor: $config.secondaryFontColor + 'aa',
    alignSelf: 'flex-end',
    paddingHorizontal: 8,
    height: 25,
    borderTopLeftRadius: 15,
    borderBottomRightRadius: 15,
    flexDirection: 'row',
  },
  name: {color: $config.primaryFontColor, lineHeight: 25, fontWeight: '700'},
  MicBackdrop: {
    width: 20,
    height: 20,
    borderRadius: 15,
    marginHorizontal: 10,
    backgroundColor: $config.secondaryFontColor,
    display: 'flex',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  MicIcon: {
    width: '80%',
    height: '80%',
    alignSelf: 'center',
  },
});

export default PinnedVideo;
