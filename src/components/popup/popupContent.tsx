import React, { useState, useEffect } from "react";
import { Box, Text, ToggleSwitch } from "@primer/react";
import "../../style.scss";

export function Popup(props): JSX.Element {
    const [active, setActive] = useState<boolean>(false);

    useEffect(() => {
        getExtensionActiveState();
    });

    const getExtensionActiveState = () => {
        chrome.storage.local.get(["summitChromeExtensionState"], (result) => {
            if (result.summitChromeExtensionState === undefined) {
                chrome.storage.local.set({'summitChromeExtensionState': { state: true }});
                setActive(true);
            } else {
                setActive(result.summitChromeExtensionState.state);
            }
        });
    }

    const handleToggle = () => {
        chrome.storage.local.set({'summitChromeExtensionState': { state: !active }});
        let queryOptions = { active: true, currentWindow: true };
        chrome.tabs.query(queryOptions, function(tabs){
            chrome.tabs.sendMessage(tabs[0].id, {state: !active});
        });
        setActive(!active);
    }

    return (<Box display="flex">
                <Box flexGrow={1}>
                <Text fontSize={2} fontWeight="bold" id="switchLabel" display="block">
                    Activate Summit
                </Text>
                </Box>
                <ToggleSwitch aria-labelledby="switchLabel" 
                                aria-describedby="switchCaption" 
                                size="small"
                                checked={active}
                                onClick={handleToggle}/>
            </Box>);
}
