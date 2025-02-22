import { JoinState } from "components/[guild]/JoinModal/utils/mapAccessJobState"
import JoinStepIndicator from "../../JoinStepIndicator"
import { getJoinStepIndicatorProps } from "../utils/getStepIndicatorProps"

const JoinStatusStepIndicator = ({
  joinState,
  entity,
}: {
  joinState: JoinState
  entity: "role" | "requirement" | "reward"
}) => {
  const props = getJoinStepIndicatorProps(entity, joinState)
  return <JoinStepIndicator {...props} />
}

export default JoinStatusStepIndicator
