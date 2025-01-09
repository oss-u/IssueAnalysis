import React from "react";
import { Overlay, Box, Text, Button } from "@primer/react";

// class InfotypeMarker extends React.Component<
//     {},
//     {}
// > {
//     render() {
//         return ();
//     }
// }

const InfotypeMarker = () => {
  // you must manage your own open state
  const [isOpen, setIsOpen] = React.useState(false);
  const noButtonRef = React.useRef(null);
  const anchorRef = React.useRef(null);
  return (
    <>
      {isOpen && (
        <Overlay
          initialFocusRef={noButtonRef}
          returnFocusRef={anchorRef}
          ignoreClickRefs={[anchorRef]}
          onEscape={() => setIsOpen(!isOpen)}
          onClickOutside={() => setIsOpen(false)}
          aria-labelledby="title"
        >
          <Box display="flex" flexDirection="column" p={2}>
            <Text id="title">
              Are you sure you would like to delete this item?
            </Text>
            <Button>yes</Button>
            <Button ref={noButtonRef}>no</Button>
          </Box>
        </Overlay>
      )}
    </>
  );
};

export default InfotypeMarker;
