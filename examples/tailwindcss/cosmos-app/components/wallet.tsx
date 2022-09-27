import { useWallet } from '@cosmos-kit/react'
import {
  Box,
  Center,
  Grid,
  GridItem,
  Icon,
  Stack,
  useColorModeValue,
  Text,
} from '@chakra-ui/react'
import { MouseEventHandler, useEffect } from 'react'
import { FiAlertTriangle } from 'react-icons/fi'
import {
  Astronaut,
  Error,
  Connected,
  ConnectedShowAddress,
  ConnectedUserInfo,
  Connecting,
  ConnectStatusWarn,
  CopyAddressBtn,
  Disconnected,
  NotExist,
  Rejected,
  RejectedWarn,
  WalletConnectComponent,
  ChainCard,
} from '../components'
import { getWalletPrettyName } from '@cosmos-kit/config'
import { ChainName } from '@cosmos-kit/core'
import { chainInfos } from '../config/chain-infos'

export const WalletSection = ({ chainName }: { chainName?: ChainName }) => {
  const walletManager = useWallet()
  const {
    connect,
    disconnect,
    openView,
    setCurrentChain,
    walletStatus,
    username,
    address,
    message,
    currentChainName,
    currentWalletName,
  } = walletManager

  const chain = chainInfos.find((c) => c.chainName === chainName)

  useEffect(() => {
    setCurrentChain(chainName)
  }, [chainName, setCurrentChain])

  // Events
  const onClickConnect: MouseEventHandler = async (e) => {
    e.preventDefault()
    openView()
    if (currentWalletName) {
      await connect()
    }
  }

  const onClickOpenView: MouseEventHandler = (e) => {
    e.preventDefault()
    openView()
  }

  // Components
  const connectWalletButton = (
    <WalletConnectComponent
      walletStatus={walletStatus}
      disconnect={
        <Disconnected buttonText="Connect Wallet" onClick={onClickConnect} />
      }
      connecting={<Connecting />}
      connected={
        <Connected buttonText={'My Wallet'} onClick={onClickOpenView} />
      }
      rejected={<Rejected buttonText="Reconnect" onClick={onClickConnect} />}
      error={<Error buttonText="Change Wallet" onClick={onClickOpenView} />}
      notExist={
        <NotExist buttonText="Install Wallet" onClick={onClickOpenView} />
      }
    />
  )

  const connectWalletWarn = (
    <ConnectStatusWarn
      walletStatus={walletStatus}
      rejected={
        <RejectedWarn
          icon={<Icon as={FiAlertTriangle} mt={1} />}
          wordOfWarning={`${getWalletPrettyName(
            currentWalletName,
          )}: ${message}`}
        />
      }
      error={
        <RejectedWarn
          icon={<Icon as={FiAlertTriangle} mt={1} />}
          wordOfWarning={`${getWalletPrettyName(
            currentWalletName,
          )}: ${message}`}
        />
      }
    />
  )

  const userInfo = (
    <ConnectedUserInfo
      username={username}
      icon={
        <div className="w-16 h-16 rounded-full mx-auto bg-gradient-to-r from-purple-500 to-blue-500"></div>
      }
    />
  )
  const addressBtn = chainName && (
    <CopyAddressBtn
      walletStatus={walletStatus}
      connected={<ConnectedShowAddress address={address} isLoading={false} />}
    />
  )

  return (
    <Center py={16}>
      <Grid
        w="full"
        maxW="sm"
        templateColumns="1fr"
        rowGap={4}
        alignItems="center"
        justifyContent="center"
      >
        {chainName && (
          <GridItem marginBottom={'20px'}>
            <ChainCard
              prettyName={chain?.label || chainName}
              icon={chain?.icon}
            />
          </GridItem>
        )}
        <GridItem px={6}>
          <Stack
            justifyContent="center"
            alignItems="center"
            borderRadius="lg"
            bg={useColorModeValue('white', 'blackAlpha.400')}
            boxShadow={useColorModeValue(
              '0 0 2px #dfdfdf, 0 0 6px -2px #d3d3d3',
              '0 0 2px #363636, 0 0 8px -2px #4f4f4f',
            )}
            spacing={4}
            px={4}
            py={{ base: 6, md: 12 }}
          >
            {userInfo}
            {addressBtn}
            <Box w="full" maxW={{ base: 52, md: 64 }}>
              {connectWalletButton}
            </Box>
            <GridItem>{connectWalletWarn}</GridItem>
          </Stack>
        </GridItem>
      </Grid>
    </Center>
  )
}
