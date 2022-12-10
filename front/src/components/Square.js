import React from 'react';
import { Box, Icon, Flex} from '@chakra-ui/react';
import { FaTimes, FaCircleNotch } from 'react-icons/fa';
const Square = ({symbol, onClick}) => {
  let BoxIcon;
   if (symbol == '1') {
     BoxIcon = <Icon as={FaTimes} color='purple.200' minH="100%" minW="80%" />;
   } else if (symbol == '2') {
     BoxIcon = <Icon as={FaCircleNotch} color='yellow.200' minH="100%" minW="80%" />;
   }

  return (
    <Flex
      bg="blue.700"
      border="6px"
      borderStyle="solid"
      borderColor="blue.900"
      borderRadius="sm"
      onClick={onClick}
      align="center"
      justify="center"
      _hover={{
        background: "blue.500",
        color: "blue.500",
      }}
      
    _active={{
        bg: 'blue.300',
        transform: 'scale(0.98)',
        borderColor: 'blue.400',
    }}
    disabled={true}
    
    >
     {BoxIcon}
    </Flex>
  );
};
Square.defaultProps = {
  symbol: ' ',
};

export default Square;