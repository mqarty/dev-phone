import React, { useCallback, useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Device } from '@twilio/voice-sdk'
import {
    updateCallInformation,
    updateMuteStatus,
    updateVoiceDeviceStatus,
} from '../../actions'

const QUIETER_INCOMING_RINGTONE_URL = 'https://sdk.twilio.com/js/client/sounds/releases/1.0.0/outgoing.mp3'

// Establish context with relevant websocket resources for child components
const TwilioVoiceContext = React.createContext(null)
export { TwilioVoiceContext }

const TwilioVoiceManager = ({ children }) => {
    const voiceDevice = useRef(null)
    const deviceDetails = useRef({})
    const twilioAccessToken = useSelector(state => state.twilioAccessToken)
    const numberInUse = useSelector(state => state.numberInUse ? state.numberInUse.phoneNumber : "")
    const dispatch = useDispatch()
    const [activeCall, setActiveCall] = useState(null)

    const updateCallInfo = useCallback((call) => {
        dispatch(updateCallInformation(call))
    }, [dispatch])

    const updateIsMutedStatus = useCallback((isMuted) => {
        dispatch(updateMuteStatus(isMuted))
    }, [dispatch])

    // responsible for making calls with Twilio Voice SDK
    const makeCall = async (destination) => {
        try {
            if (!voiceDevice.current) {
                console.warn('Voice device is not ready yet; cannot place call.');
                return;
            }
            const call = await voiceDevice.current.connect({
                params: {
                    "to": destination,
                    "from": numberInUse,
                    "identity": "dev-phone"
                }
            })
            setActiveCall(call)
        } catch (error) {
            console.error(error)
        }
    }

    // responsible for handling call events and defining call methods
    useEffect(() => {
        if (activeCall) {
            deviceDetails.current.acceptCall = () => activeCall.accept()
            deviceDetails.current.declineCall = () => {
                activeCall.reject()
                setActiveCall(null)
            }
            updateCallInfo(activeCall)

            // Responsible for disconnecting a specific call
            deviceDetails.current.hangUp = () => {
                activeCall.disconnect()
                setActiveCall(null)
            }

            // Responsible for sending DTMF over the call
            deviceDetails.current.sendDTMF = (num) => {
                console.log("Sending DTMF " + JSON.stringify(num));
                activeCall.sendDigits(num);
            }

            deviceDetails.current.toggleMute = () => {
                console.log('activeCall', activeCall);
                if (!activeCall) {
                    return;
                }
                console.log('isMuted', activeCall.isMuted());
                activeCall.mute(!activeCall.isMuted());
            }

            activeCall.on('accept', call => {
                updateCallInfo(call)
            })

            activeCall.on('connect', call => {
                updateCallInfo(call)
            })

            activeCall.on('disconnect', call => {
                call.removeAllListeners()
                setActiveCall(null)
                updateCallInfo(null)
            })

            activeCall.on('cancel', call => {
                call.removeAllListeners()
                setActiveCall(null)
                updateCallInfo(null)
            })

            activeCall.on('reject', call => {
                call.removeAllListeners()
                setActiveCall(null)
                updateCallInfo(null)
            })

            activeCall.on('error', (error) => {
                console.error('Active call error', error)
            })

            activeCall.on('mute', isMuted => {
                updateIsMutedStatus(isMuted);
            })
        }
    }, [activeCall, updateCallInfo, updateIsMutedStatus])

    useEffect(() => {
        if (!twilioAccessToken) {
            dispatch(updateVoiceDeviceStatus('disconnected'));
            return;
        }

        if (voiceDevice.current) {
            try {
                voiceDevice.current.destroy();
            } catch (error) {
                console.error('Failed to destroy existing voice device', error);
            }
            voiceDevice.current = null;
        }

        const device = new Device(twilioAccessToken, {
            codecPreferences: ["opus", "pcmu"],
            fakeLocalDTMF: true,
            debug: false,
            enableRingingState: true,
            sounds: {
                incoming: QUIETER_INCOMING_RINGTONE_URL
            }
        })

        device.on("registered", () => {
            console.log("Registered voice device")
            dispatch(updateVoiceDeviceStatus('registered'));
        })

        device.on("unregistered", () => {
            console.warn("Voice device became unregistered")
            dispatch(updateVoiceDeviceStatus('unregistered'));
        })

        device.on("incoming", (call) => {
            console.log('Incoming call received', call?.parameters?.CallSid || call?._callSid)
            setActiveCall(call)
        })

        device.on("error", (error) => {
            console.error("Voice device error", error)
            dispatch(updateVoiceDeviceStatus('error'));
        })

        device.on("registering", () => {
            console.log("Registering voice device")
            dispatch(updateVoiceDeviceStatus('registering'));
        })

        device.register()

        voiceDevice.current = device

        deviceDetails.current = {
            voiceDevice: voiceDevice,
            hangUp: () => { },
            declineCall: () => { },
            sendDTMF: () => { },
            updateCallInfo,
            makeCall,
            toggleMute: () => { }
        }

        return () => {
            try {
                device.destroy();
            } catch (error) {
                console.error('Failed to clean up voice device', error);
            }
            if (voiceDevice.current === device) {
                voiceDevice.current = null;
            }
            dispatch(updateVoiceDeviceStatus('disconnected'));
        }
    }, [dispatch, twilioAccessToken, updateCallInfo])

    if (!deviceDetails.current.voiceDevice) {
        deviceDetails.current = {
            voiceDevice: voiceDevice,
            hangUp: () => { },
            declineCall: () => { },
            sendDTMF: () => { },
            updateCallInfo,
            makeCall,
            toggleMute: () => { }
        }
    }

    return (
        <TwilioVoiceContext.Provider value={deviceDetails.current}>
            {children}
        </TwilioVoiceContext.Provider>
    )

};

export default TwilioVoiceManager
