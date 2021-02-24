import { useAsyncRetry } from 'react-use'
import { PluginTraderRPC } from '../messages'

export function usePoolIds(address: string) {
    return useAsyncRetry(async () => {
        if (!address) return []
        return PluginTraderRPC.fetchPoolsByTokenAddress(address)
    }, [address])
}