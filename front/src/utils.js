import Web3 from 'web3';

export const toEther = (wei) => {
    return Web3.utils.fromWei(wei, 'ether')
}

export const toWei = (ether) => {
    return Web3.utils.toWei(ether, 'ether')
}

export const extractMessageFromError = (message) => {
    try {
        let json_error = message.replace(/^Internal JSON-RPC error./, "")
        let error = JSON.parse(json_error)
        return error["message"]
    } catch (_) {
        return message
    }
}