import {
  Alert,
  AlertDescription,
  AlertIcon,
  Collapse,
  Icon,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
} from "@chakra-ui/react"
import { Chains } from "chains"
import useAccess from "components/[guild]/hooks/useAccess"
import useGuild from "components/[guild]/hooks/useGuild"
import { usePostHogContext } from "components/_app/PostHogProvider"
import useWeb3ConnectionManager from "components/_app/Web3ConnectionManager/hooks/useWeb3ConnectionManager"
import Button from "components/common/Button"
import { Modal } from "components/common/Modal"
import { Coin } from "phosphor-react"
import { paymentSupportedChains } from "utils/guildCheckout/constants"
import { useChainId } from "wagmi"
import { useRequirementContext } from "../RequirementContext"
import BuyTotal from "./components/BuyTotal"
import { useGuildCheckoutContext } from "./components/GuildCheckoutContex"
import PaymentFeeCurrency from "./components/PaymentFeeCurrency"
import PaymentMethodButtons from "./components/PaymentMethodButtons"
import { UnlockingRewards } from "./components/PaymentTransactionStatusModal"
import TOSCheckbox from "./components/TOSCheckbox"
import BuyAllowanceButton from "./components/buttons/BuyAllowanceButton"
import BuyButton from "./components/buttons/BuyButton"
import DisconnectFuelButton from "./components/buttons/DisconnectFuelButton"
import SwitchNetworkButton from "./components/buttons/SwitchNetworkButton"

const BuyPass = () => {
  const { captureEvent } = usePostHogContext()

  const { isWeb3Connected, type } = useWeb3ConnectionManager()
  const chainId = useChainId()
  const requirement = useRequirementContext()
  const { isOpen, onOpen, onClose } = useGuildCheckoutContext()
  const { urlName, name, roles } = useGuild()
  const role = roles?.find((r) => r.id === requirement?.roleId)

  const { data: accessData, isValidating: isAccessValidating } = useAccess(
    requirement?.roleId
  )

  const userSatisfiesOtherRequirements = accessData?.requirements
    ?.filter((r) => r.requirementId !== requirement?.id)
    ?.every((r) => r.access)

  const onClick = () => {
    onOpen()
    captureEvent("Click: Buy (Requirement)", {
      guild: urlName,
    })
  }

  if (
    !isWeb3Connected ||
    (!accessData && isAccessValidating) ||
    requirement?.type !== "PAYMENT" ||
    !paymentSupportedChains.includes(requirement?.chain)
  )
    return null

  return (
    <>
      <Button
        data-test="payment-requirement-buy-button"
        colorScheme="blue"
        size="sm"
        leftIcon={<Icon as={Coin} />}
        borderRadius="lg"
        fontWeight="medium"
        onClick={onClick}
      >
        Pay
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} colorScheme="duotone">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader pb={4} pr={16}>
            {`Buy ${name} pass`}
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            {!userSatisfiesOtherRequirements && role?.logic === "AND" && (
              <Alert
                status="warning"
                bgColor="orange.100"
                color="black"
                mb="6"
                pb="5"
              >
                <AlertIcon color="orange.500" />
                <Stack>
                  <AlertDescription position="relative" top={1}>
                    There're other requirements you don't satisfy, so the pass alone
                    won't grant you access
                  </AlertDescription>
                </Stack>
              </Alert>
            )}

            <UnlockingRewards roleId={role.id} />
          </ModalBody>

          <ModalFooter pt={10} flexDir="column">
            <PaymentMethodButtons />

            <Stack spacing={8} w="full">
              <PaymentFeeCurrency />
              <BuyTotal />

              <Stack
                spacing={2}
                sx={{
                  ".chakra-collapse": {
                    overflow: "unset!important",
                    overflowX: "visible",
                    overflowY: "hidden",
                  },
                }}
              >
                {type === "EVM" ? (
                  <>
                    <SwitchNetworkButton targetChainId={Chains[requirement.chain]} />

                    <Collapse in={chainId === Chains[requirement.chain]}>
                      <TOSCheckbox>
                        I understand that if the owner changes the requirements, I
                        could lose access.
                      </TOSCheckbox>
                      <BuyAllowanceButton />
                    </Collapse>

                    <BuyButton />
                  </>
                ) : (
                  <DisconnectFuelButton>Buy pass</DisconnectFuelButton>
                )}
              </Stack>
            </Stack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default BuyPass
