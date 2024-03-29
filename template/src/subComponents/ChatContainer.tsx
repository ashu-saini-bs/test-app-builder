import React, {useContext, useRef} from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
} from 'react-native';
import ChatBubble from './ChatBubble';
import ChatContext from '../components/ChatContext';
import icons from '../assets/icons';

/**
 * Chat container is the component which renders all the chat messages
 * It retrieves all the messages from the appropriate stores (Message store an provate message store)
 * and maps it to a ChatBubble
 */
const ChatContainer = (props: any) => {
  const {
    selectedUser,
    privateActive,
    setPrivateActive,
    selectedUsername,
  } = props;
  const {messageStore, localUid, privateMessageStore} = useContext(ChatContext);
  const scrollViewRef = useRef<ScrollView>(null);
  return (
    <View style={style.containerView}>
      {privateActive ? (
        <View style={style.row}>
          <TouchableOpacity
            style={style.backButton}
            onPress={() => setPrivateActive(false)}>
            <Image
              resizeMode={'contain'}
              style={style.backIcon}
              source={{uri: icons.backBtn}}
            />
          </TouchableOpacity>
          <Text style={style.name}>{selectedUsername}</Text>
        </View>
      ) : (
        <></>
      )}
      <ScrollView ref={scrollViewRef} onContentSizeChange={()=>{scrollViewRef.current?.scrollToEnd({ animated: true })}}>
        {!privateActive ? (
          messageStore.map((message: any) => {
            return (
              <ChatBubble
                isLocal={localUid === message.uid}
                msg={message.msg}
                ts={message.ts}
                uid={message.uid}
                key={message.ts}
              />
            );
          })
        ) : privateMessageStore[selectedUser.uid] ? (
          privateMessageStore[selectedUser.uid].map((message: any) => {
            return (
              <ChatBubble
                isLocal={localUid === message.uid}
                msg={message.msg}
                ts={message.ts}
                uid={message.uid}
                key={message.ts}
              />
            );
          })
        ) : (
          <></>
        )}
      </ScrollView>
    </View>
  );
};

const style = StyleSheet.create({
  containerView: {flex: 8},
  row: {flexDirection: 'row', marginTop: 5},
  backButton: {
    paddingVertical: 10,
    marginLeft: 10,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: Platform.OS === 'web' ? '500' : '700',
    marginLeft: 10,
    color: $config.primaryFontColor,
    alignSelf: 'center',
  },
  backIcon: {
    width: 20,
    height: 12,
    alignSelf: 'center',
    justifyContent: 'center',
    tintColor: '#333',
  },
});
export default ChatContainer;
