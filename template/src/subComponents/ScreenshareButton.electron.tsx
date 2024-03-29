import React, {useContext, useState} from 'react';
import {
  Image,
  TouchableOpacity,
  View,
  Picker,
  Text,
  StyleSheet,
} from 'react-native';
import icons from '../assets/icons';
import RtcContext from '../../agora-rn-uikit/src/RtcContext';
import ColorContext from '../components/ColorContext';

interface ScreenSharingProps {
  screenshareActive: boolean;
  setScreenshareActive: React.Dispatch<React.SetStateAction<boolean>>;
}
/**
 * A component to start and stop screen sharing on Desktop clients.
 * Screen sharing is not yet implemented on mobile platforms.
 * Web has it's own screen sharing component
 */

const ScreenshareButton = (props: ScreenSharingProps) => {
  const {primaryColor} = useContext(ColorContext);
  const [screenListActive, setScreenListActive] = useState(false);
  const [selectedScreen, setSelectedScreen] = useState(0);
  const [screens, setScreens] = useState([]);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const rtc = useContext(RtcContext);
  const {screenshareActive, setScreenshareActive} = props;
  rtc.RtcEngine.addListener('ScreenshareStopped', () => {
    setScreenshareActive(false);
  });
  return (
    <>
      <TouchableOpacity
        style={
          screenshareActive
            ? style.greenLocalButton
            : [style.localButton, {borderColor: primaryColor}]
        }
        disabled={buttonDisabled}
        onPress={() => {
          if (!screenshareActive) {
            setScreenshareActive(true);
            setScreens(rtc.RtcEngine.getScreenDisplaysInfo());
            setScreenListActive(true);
            setButtonDisabled(true);
          } else {
            rtc.RtcEngine.startScreenshare();
          }
        }}>
        <Image
          source={{uri: icons.screenshareIcon}}
          style={[style.buttonIcon, {tintColor: primaryColor}]}
        />
      </TouchableOpacity>
      {screenListActive ? (
        <View style={style.popupView}>
          <Text style={style.popupText}>Please select a screen to share:</Text>
          <Picker
            selectedValue={selectedScreen}
            style={style.popupPicker}
            onValueChange={(itemValue) => setSelectedScreen(itemValue)}>
            {screens.map((device: any, i) => {
              console.log(device, i);
              return (
                <Picker.Item label={'screen' + (i + 1)} value={i} key={i} />
              );
            })}
          </Picker>
          <TouchableOpacity
            onPress={() => {
              rtc.RtcEngine.startScreenshare(screens[selectedScreen]);
              setScreenListActive(false);
              setScreenshareActive(true);
              setButtonDisabled(false);
            }}
            style={style.popupButton}>
            <Text style={style.buttonText}>Start Sharing</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <></>
      )}
    </>
  );
};

const style = StyleSheet.create({
  localButton: {
    backgroundColor: $config.secondaryFontColor,
    borderRadius: 2,
    borderColor: $config.primaryColor,
    // borderWidth: 1,
    width: 40,
    height: 40,
    display: 'flex',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  greenLocalButton: {
    backgroundColor: '#4BEB5B',
    borderRadius: 2,
    borderColor: '#F86051',
    width: 40,
    height: 40,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    width: 40,
    height: 35,
    tintColor: $config.primaryColor,
  },
  popupView: {
    position: 'absolute',
    top: '-400%',
    left: '20%',
    width: '60%',
    height: '350%',
    backgroundColor: $config.secondaryFontColor,
    justifyContent: 'space-evenly',
    alignContent: 'center',
    paddingVertical: 5,
  },
  popupText: {
    width: '100%',
    fontSize: 24,
    textAlign: 'center',
    color: $config.secondaryFontColor,
  },
  popupPicker: {
    height: '40%',
    width: '50vw',
    alignSelf: 'center',
    // paddingVertical: 2,
    // marginVertical: 5,
  },
  popupButton: {
    backgroundColor: '#6E757D',
    height: '20%',
    width: '50vw',
    alignSelf: 'center',
    alignContent: 'center',
    justifyContent: 'center',
  },
  popupPickerHolder: {
    // height: '40%',
    justifyContent: 'space-around',
  },
  buttonText: {
    width: '100%',
    height: 45,
    lineHeight: 45,
    fontSize: 20,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: $config.secondaryFontColor,
  },
});

export default ScreenshareButton;
