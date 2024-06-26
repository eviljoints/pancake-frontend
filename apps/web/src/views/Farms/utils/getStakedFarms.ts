import BigNumber from 'bignumber.js'
import { V3FarmWithoutStakedValue, V2FarmWithoutStakedValue } from 'views/Farms/FarmsV3'

export const getStakedFarms = (
  farmsData: (V3FarmWithoutStakedValue | V2FarmWithoutStakedValue)[],
): (V3FarmWithoutStakedValue | V2FarmWithoutStakedValue)[] => {
  return farmsData.filter((farm) => {
    if (farm.version === 3) {
      return farm.stakedPositions.length > 0
    }
    return (
      new BigNumber(farm?.userData?.stakedBalance ?? 0).gt(0) ||
      new BigNumber(farm?.userData?.proxy?.stakedBalance ?? 0).gt(0) ||
      new BigNumber(farm?.bCakeUserData?.stakedBalance ?? 0).gt(0)
    )
  })
}
