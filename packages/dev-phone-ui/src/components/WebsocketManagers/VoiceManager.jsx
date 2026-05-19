import React, { useCallback, useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Device } from '@twilio/voice-sdk'
import {
<<<<<<< HEAD
    addDebugEvent,
=======
>>>>>>> f4159d148e928e1c1d073ebc81280c379b7e51d9
    updateCallInformation,
    updateMuteStatus,
    updateVoiceDeviceError,
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

    const logDebugEvent = useCallback((level, message, data = null) => {
        dispatch(addDebugEvent({
            level,
            message,
            data,
            timestamp: new Date().toISOString(),
        }));
    }, [dispatch])

    // responsible for making calls with Twilio Voice SDK
    const makeCall = async (destination) => {
        try {
            if (!voiceDevice.current) {
                console.warn('Voice device is not ready yet; cannot place call.');
<<<<<<< HEAD
                logDebugEvent('warn', 'Attempted outbound call while device was not ready');
=======
>>>>>>> f4159d148e928e1c1d073ebc81280c379b7e51d9
                return;
            }
            const call = await voiceDevice.current.connect({
                params: {
                    "to": destination,
                    "from": numberInUse,
                    "identity": "dev-phone"
                }
            })
            logDebugEvent('info', 'Outbound call started', {
                to: destination,
                from: numberInUse,
                sid: call?.parameters?.CallSid || call?._callSid || null,
            });
            setActiveCall(call)
        } catch (error) {
            console.error(error)
            logDebugEvent('error', 'Outbound call failed to start', {
                message: error?.message || 'Unknown error',
                code: error?.code || null,
            });
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
                logDebugEvent('info', 'Call accepted', {
                    sid: call?.parameters?.CallSid || call?._callSid || null,
                });
                updateCallInfo(call)
            })

            activeCall.on('connect', call => {
                logDebugEvent('info', 'Call connected', {
                    sid: call?.parameters?.CallSid || call?._callSid || null,
                });
                updateCallInfo(call)
            })

            activeCall.on('disconnect', call => {
                logDebugEvent('info', 'Call disconnected', {
                    sid: call?.parameters?.CallSid || call?._callSid || null,
                });
                call.removeAllListeners()
                setActiveCall(null)
                updateCallInfo(null)
            })

            activeCall.on('cancel', call => {
<<<<<<< HEAD
                logDebugEvent('warn', 'Call canceled', {
                    sid: call?.parameters?.CallSid || call?._callSid || null,
                });
=======
>>>>>>> f4159d148e928e1c1d073ebc81280c379b7e51d9
                call.removeAllListeners()
                setActiveCall(null)
                updateCallInfo(null)
            })

            activeCall.on('reject', call => {
<<<<<<< HEAD
                logDebugEvent('warn', 'Call rejected', {
                    sid: call?.parameters?.CallSid || call?._callSid || null,
                });
=======
>>>>>>> f4159d148e928e1c1d073ebc81280c379b7e51d9
                call.removeAllListeners()
                setActiveCall(null)
                updateCallInfo(null)
            })

            activeCall.on('error', (error) => {
                console.error('Active call error', error)
<<<<<<< HEAD
                logDebugEvent('error', 'Active call error', {
                    message: error?.message || 'Unknown call error',
                    code: error?.code || null,
                });
=======
>>>>>>> f4159d148e928e1c1d073ebc81280c379b7e51d9
            })

            activeCall.on('mute', isMuted => {
                logDebugEvent('info', isMuted ? 'Call muted' : 'Call unmuted')
                updateIsMutedStatus(isMuted);
            })
        }
<<<<<<< HEAD
    }, [activeCall, logDebugEvent, updateCallInfo, updateIsMutedStatus])
=======
    }, [activeCall, updateCallInfo, updateIsMutedStatus])
>>>>>>> f4159d148e928e1c1d073ebc81280c379b7e51d9

    useEffect(() => {
        if (!twilioAccessToken) {
            dispatch(updateVoiceDeviceStatus('disconnected'));
            dispatch(updateVoiceDeviceError(null));
<<<<<<< HEAD
            logDebugEvent('warn', 'Voice device disconnected: missing access token');
=======
>>>>>>> f4159d148e928e1c1d073ebc81280c379b7e51d9
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
            dispatch(updateVoiceDeviceError(null));
<<<<<<< HEAD
            logDebugEvent('info', 'Voice device registered');
=======
>>>>>>> f4159d148e928e1c1d073ebc81280c379b7e51d9
        })

        device.on("unregistered", () => {
            console.warn("Voice device became unregistered")
            dispatch(updateVoiceDeviceStatus('unregistered'));
<<<<<<< HEAD
            logDebugEvent('warn', 'Voice device unregistered');
=======
>>>>>>> f4159d148e928e1c1d073ebc81280c379b7e51d9
        })

        device.on("incoming", (call) => {
            console.log('Incoming call received', call?.parameters?.CallSid || call?._callSid)
<<<<<<< HEAD
            logDebugEvent('info', 'Incoming call received', {
                sid: call?.parameters?.CallSid || call?._callSid || null,
                from: call?.parameters?.From || call?.parameters?.from || null,
            });
=======
>>>>>>> f4159d148e928e1c1d073ebc81280c379b7e51d9
            setActiveCall(call)
        })

        device.on("error", (error) => {
            console.error("Voice device error", error)
            dispatch(updateVoiceDeviceStatus('error'));
            dispatch(updateVoiceDeviceError({
                code: error?.code || null,
                message: error?.message || 'Unknown voice device error',
                causes: Array.isArray(error?.causes) ? error.causes : [],
            }));
<<<<<<< HEAD
            logDebugEvent('error', 'Voice device error', {
                message: error?.message || 'Unknown voice device error',
                code: error?.code || null,
            });
=======
>>>>>>> f4159d148e928e1c1d073ebc81280c379b7e51d9
        })

        device.on("registering", () => {
            console.log("Registering voice device")
            dispatch(updateVoiceDeviceStatus('registering'));
            dispatch(updateVoiceDeviceError(null));
<<<<<<< HEAD
            logDebugEvent('info', 'Voice device registering');
=======
>>>>>>> f4159d148e928e1c1d073ebc81280c379b7e51d9
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
<<<<<<< HEAD
            logDebugEvent('info', 'Voice device destroyed');
        }
    }, [dispatch, logDebugEvent, twilioAccessToken, updateCallInfo])
=======
        }
    }, [dispatch, twilioAccessToken, updateCallInfo])
>>>>>>> f4159d148e928e1c1d073ebc81280c379b7e51d9

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
