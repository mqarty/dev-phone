import { useEffect, useRef, useState } from 'react';
import { Alert, Anchor, Box, Column, Grid, Flex, Text, MediaFigure, MediaBody, MediaObject, Tooltip } from "@twilio-paste/core";
import { LogoTwilioIcon } from '@twilio-paste/icons/esm/LogoTwilioIcon';
import { InformationIcon } from "@twilio-paste/icons/esm/InformationIcon";
import { CopyIcon } from "@twilio-paste/icons/esm/CopyIcon";
import { useSelector } from 'react-redux';

function Header({ devPhoneName, numberInUse }) {
    const [showCopyToast, setShowCopyToast] = useState(false);
    const copyToastTimeoutRef = useRef(null);
    const voiceDeviceStatus = useSelector((state) => state.voiceDeviceStatus || 'disconnected');

    const statusConfig = {
        registered: { label: 'Voice Active', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.18)' },
        registering: { label: 'Voice Connecting', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.22)' },
        unregistered: { label: 'Voice Inactive', color: '#f97316', bg: 'rgba(249, 115, 22, 0.20)' },
        error: { label: 'Voice Error', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.20)' },
        disconnected: { label: 'Voice Offline', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.20)' },
    };
    const currentStatus = statusConfig[voiceDeviceStatus] || statusConfig.disconnected;

    useEffect(() => {
        return () => {
            if (copyToastTimeoutRef.current) {
                clearTimeout(copyToastTimeoutRef.current);
            }
        };
    }, []);

    const showCopiedToast = () => {
        setShowCopyToast(true);
        if (copyToastTimeoutRef.current) {
            clearTimeout(copyToastTimeoutRef.current);
        }
        copyToastTimeoutRef.current = setTimeout(() => setShowCopyToast(false), 2000);
    };

    const handleCopyNumber = async (event) => {
        event.preventDefault();

        if (!numberInUse) {
            return;
        }

        try {
            if (navigator?.clipboard?.writeText) {
                await navigator.clipboard.writeText(numberInUse);
                showCopiedToast();
                return;
            }
        } catch (error) {
            // Fallback to legacy copy flow if the Clipboard API isn't available or allowed.
        }

        const input = document.createElement('textarea');
        input.value = numberInUse;
        input.setAttribute('readonly', '');
        input.style.position = 'absolute';
        input.style.left = '-9999px';
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        showCopiedToast();
    };

    return (
        <Box
            width="100%"
            height={"size10"}
            hAlignContent="center"
            backgroundColor={"colorBackgroundBrandStrong"}
            color="colorTextInverse"
            padding={"space60"}
        >
            <Grid gutter={"space50"}>
                <Column span={3}>
                    <MediaObject verticalAlign="center">
                        <MediaFigure spacing="space40">
                            <LogoTwilioIcon display="block" size={42} decorative />
                        </MediaFigure>
                        <MediaBody>
                            <Text as="h2" fontSize="fontSize60" lineHeight="lineHeight60">
                                <Text href="/" as="a" color="colorTextInverse" fontSize="inherit" lineHeight="inherit" textDecoration="none">Dev Phone</Text>
                            </Text>
                            <Text as="h3" fontSize="fontSize20" lineHeight="lineHeight20" color="colorTextWeak">
                                Twilio Labs Project
                            </Text>
                        </MediaBody>
                    </MediaObject>
                </Column>
                <Column offset={5} span={2}>
                    <Flex hAlignContent={"center"} vertical grow height="100%" vAlignContent={"center"} >
                        <Text as="p" color={"colorTextInverse"}>{devPhoneName ? devPhoneName : "loading"}</Text>
                        <Flex width={"100%"} hAlignContent={"center"}>
                            <Text as="p" marginRight={"space20"} color="colorTextInverse" fontWeight={"fontWeightSemibold"} variant="default">Dev Phone ID</Text>
                            <Tooltip text="This is the ID I made to create and use Twilio services for your Dev Phone.">
                                <Anchor href="javascript:void" variant="inverse">
                                    <InformationIcon decorative={false} title="Show details about Dev Phone ID" display="block" />
                                </Anchor>
                            </Tooltip>
                            <Tooltip text="Real-time browser voice registration status.">
                                <Box
                                    as="span"
                                    marginLeft="space40"
                                    paddingX="space30"
                                    paddingY="space10"
                                    borderRadius="borderRadius20"
                                    style={{
                                        backgroundColor: currentStatus.bg,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                    }}
                                >
                                    <Box
                                        as="span"
                                        borderRadius="borderRadiusCircle"
                                        style={{
                                            width: '8px',
                                            height: '8px',
                                            backgroundColor: currentStatus.color,
                                        }}
                                    />
                                    <Text
                                        as="span"
                                        fontSize="fontSize10"
                                        fontWeight="fontWeightSemibold"
                                        color="colorTextInverse"
                                    >
                                        {currentStatus.label}
                                    </Text>
                                </Box>
                            </Tooltip>
                        </Flex>
                    </Flex>
                </Column>
                <Column span={2}>
                    <Flex hAlignContent={"center"} vertical grow height="100%" vAlignContent={"center"} >
                        <Flex hAlignContent={"center"} vAlignContent={"center"}>
                            <Text as="p" color={"colorTextInverse"}>{numberInUse ? numberInUse : "N/A"}</Text>
                            <Tooltip text="Copy Twilio Number">
                                <Anchor
                                    href="javascript:void"
                                    variant="inverse"
                                    marginLeft="space20"
                                    onClick={handleCopyNumber}
                                >
                                    <CopyIcon decorative={false} title="Copy Twilio Number" display="block" />
                                </Anchor>
                            </Tooltip>
                        </Flex>
                        <Flex width={"100%"} hAlignContent={"center"}>
                            <Text as="p" marginRight={"space20"} color="colorTextInverse" fontWeight={"fontWeightSemibold"} variant="default">Twilio Number</Text>
                            <Tooltip text="Text or call this Twilio phone number to connect to your Dev Phone.">
                                <Anchor href="javascript:void" variant="inverse">
                                    <InformationIcon decorative={false} title="Show details about Twilio Phone Number" display="block" />
                                </Anchor>
                            </Tooltip>
                        </Flex>
                    </Flex>
                </Column>
            </Grid>
            {showCopyToast && (
                <Box
                    position="fixed"
                    bottom="space70"
                    right="space70"
                    boxShadow="shadowCard"
                    style={{ zIndex: 9999, minWidth: '240px' }}
                >
                    <Alert variant="neutral">
                        Copied Twilio number to clipboard
                    </Alert>
                </Box>
            )}
        </Box>
    )
}

export default Header
