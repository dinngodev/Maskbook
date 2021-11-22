import {
    ChainId,
    createLookupTableResolver,
    ERC721TokenDetailed,
    EthereumTokenType,
    FungibleTokenDetailed,
    isSameAddress,
} from '@masknet/web3-shared-evm'
import { compact, first } from 'lodash-unified'

import urlcat from 'urlcat'
import { AssetOrder, NFTAsset, NFTAssetOwner, NFTHistory, OrderSide } from '../types/NFT'

const RaribleMainnetURL = 'https://api-mainnet.rarible.com/marketplace/api/v4/'
const RaribleChainURL = 'https://ethereum-api.rarible.org/'
const RaribleIPFSURL = 'https://ipfs.rarible.com/ipfs/'
const RaribleUserURL = 'https://rarible.com/user/'
const RaribleRopstenUserURL = 'https://ropsten.rarible.com/user/'

const RaribleMainnetAPI = 'https://api-staging.rarible.com/protocol/v0.1'
export enum RaribleEventType {
    ORDER = 'order',
    BUY = 'buy',
    TRANSFER = 'transfer',
    OFFER = 'offer',
}

export interface RaribleTransferItem {
    type: string
    from: string
}

export interface Ownership {
    id: string
    token: string
    tokenId: string
    owner: string
    value: number
    date: string
    price: number
    priceEth: string
    buyToken: string
    buyTokenId: string
    status: string
    selling: number
    sold: number
    stock: number
    signature: string
    pending: RaribleTransferItem[]
    blacklisted: boolean
    creator: string
    verified: boolean
    categories: string[]
    likes: number
}

export interface Creator {
    account: string
    value: number
}

export interface RaribleHistory {
    '@type': RaribleEventType
    id: string
    owner: string
    value: number
    price: string
    buyToken: string
    buyTokenId: string
    buyer?: string
    from?: string
    date: Date
    transactionHash: string
}

export interface Meta {
    name: string
    description: string
    attributes: {
        key: string
        value: string
    }[]
    image: {
        meta: {
            PREVIEW: {
                type: string
                width: number
                height: number
            }
        }
        url: {
            BIG: string
            ORIGINAL: string
            PREVIEW: string
        }
        name: string
    }
    animation?: {
        meta: {
            PREVIEW: {
                type: string
                width: number
                height: number
            }
        }
        url: {
            BIG: string
            ORIGINAL: string
            PREVIEW: string
        }
    }
}

export interface Royalty {
    recipient: string
    value: number
}

export interface Attribute {
    key: string
    value: string
}

export interface Salt {
    value: string
    type: string
}

export interface RaribleNFTItemMapResponse {
    contract: string
    creators: Creator[]
    date: string
    deleted: boolean
    id: string
    lazySupply: string
    meta: Meta
    owners: string[]
    royalties: Royalty[]
    pending: RaribleTransferItem[]
    supply: string
    tokenId: string
}

export interface RaribleOfferResponse {
    token: string
    tokenId: string
    assetType: string
    maker: string
    salt: Salt
    buyValue: number
    buyToken: string
    buyTokenId: string
    buyAssetType: string
    value: number
    signature: string
    updateDate: string
    importantUpdateDate: string
    updateStateDate: string
    contractVersion: number
    fee: string
    sold: number
    canceled: boolean
    pending: RaribleTransferItem[]
    buyPriceEth: string
    version: number
    id: string
    active: boolean
    buyPrice: number
    sellPrice: number
    buyStock: number
}

export enum RaribleProfileType {
    USER = 'USER',
    COLLECTION = 'COLLECTION',
}

export interface RaribleProfileResponse {
    blacklisted: boolean
    cover: string
    followers: number
    followings: number
    has3Box: boolean
    id: string
    image: string
    name?: string
    description?: string
    type: RaribleProfileType
}

export const resolveRaribleUserNetwork = createLookupTableResolver<ChainId.Mainnet | ChainId.Ropsten, string>(
    {
        [ChainId.Mainnet]: RaribleUserURL,
        [ChainId.Ropsten]: RaribleRopstenUserURL,
    },
    RaribleUserURL,
)

function toRaribleImage(url?: string) {
    if (!url) return ''
    return `${RaribleIPFSURL}${url.replace('ipfs://ipfs/', '')}`
}

async function fetchFromRarible<T>(root: string, subPath: string, config = {} as RequestInit) {
    const response = await (
        await fetch(urlcat(root, subPath), {
            mode: 'cors',
            ...config,
        })
    ).json()

    return response as T
}

export async function getProfilesFromRarible(addresses: (string | undefined)[]) {
    return fetchFromRarible<RaribleProfileResponse[]>(RaribleMainnetURL, 'profiles/list', {
        method: 'POST',
        body: JSON.stringify(addresses),
        headers: {
            'content-type': 'application/json',
        },
    })
}

export async function getOffers(tokenAddress: string, tokenId: string, chainId: ChainId): Promise<AssetOrder[]> {
    const orders = await fetchFromRarible<RaribleOfferResponse[]>(
        RaribleMainnetURL,
        `items/${tokenAddress}:${tokenId}/offers`,
        {
            method: 'POST',
            body: JSON.stringify({ size: 20 }),
            headers: {
                'content-type': 'application/json',
            },
        },
    )
    const profiles = await getProfilesFromRarible(orders.map((item) => item.maker))
    return orders.map((order) => {
        const ownerInfo = profiles.find((owner) => owner.id === order.maker)
        return {
            created_time: order.updateDate,
            current_price: order.buyPriceEth,
            current_bounty: order.fee,

            payment_token: order.token,
            listing_time: 0,
            side: OrderSide.Buy,
            quantity: '1',
            expiration_time: 0,
            order_hash: order.signature,
            approved_on_chain: false,
            maker_account: {
                user: {
                    username: ownerInfo?.name ?? '',
                },
                address: ownerInfo?.id ?? '',
                profile_img_url: toRaribleImage(ownerInfo?.image),
                link: `${resolveRaribleUserNetwork(chainId as number)}${ownerInfo?.id ?? ''}`,
            } as NFTAssetOwner,
        } as AssetOrder
    })
}

export async function getListings(tokenAddress: string, tokenId: string, chainId: ChainId): Promise<AssetOrder[]> {
    const assets = await fetchFromRarible<Ownership[]>(RaribleMainnetURL, `items/${tokenAddress}:${tokenId}/ownerships`)
    const listings = assets.filter((x) => x.selling)
    const profiles = await getProfilesFromRarible(listings.map((x) => x.owner))
    return listings.map((asset) => {
        const ownerInfo = profiles.find((owner) => owner.id === asset.owner)
        return {
            created_time: asset.date,
            approved_on_chain: false,
            current_price: asset.priceEth,
            payment_token: asset.token,
            listing_time: 0,
            side: OrderSide.Buy,
            quantity: '1',
            expiration_time: 0,
            order_hash: asset.signature,
            maker_account: {
                user: {
                    username: ownerInfo?.name ?? '',
                },
                address: ownerInfo?.id ?? '',
                profile_img_url: toRaribleImage(ownerInfo?.image),
                link: `${resolveRaribleUserNetwork(chainId as number)}${ownerInfo?.id ?? ''}`,
            } as NFTAssetOwner,
        }
    })
}

export async function getOrder(tokenAddress: string, tokenId: string, side: OrderSide, chainId: ChainId) {
    switch (side) {
        case OrderSide.Buy:
            return getOffers(tokenAddress, tokenId, chainId)
        case OrderSide.Sell:
            return getListings(tokenAddress, tokenId, chainId)
        default:
            return []
    }
}

export async function getHistory(tokenAddress: string, tokenId: string): Promise<NFTHistory[]> {
    let histories = await fetchFromRarible<RaribleHistory[]>(RaribleMainnetURL, `activity`, {
        method: 'POST',
        body: JSON.stringify({
            // types: ['BID', 'BURN', 'BUY', 'CANCEL', 'CANCEL_BID', 'ORDER', 'MINT', 'TRANSFER', 'SALE'],
            filter: {
                '@type': 'by_item',
                address: tokenAddress,
                tokenId,
            },
            size: 100,
        }),
        headers: {
            'content-type': 'application/json',
        },
    })

    if (histories.length) {
        histories = histories.filter((x) => Object.values(RaribleEventType).includes(x['@type']))
    }

    const profiles = await getProfilesFromRarible(
        compact([
            ...histories.map((history) => history.owner),
            ...histories.map((history) => history.buyer),
            ...histories.map((history) => history.from),
        ]),
    )

    return histories.map((history) => {
        const ownerInfo = profiles.find((profile) => profile.id === history.owner)
        const fromInfo = profiles.find((profile) => profile.id === history.buyer || profile.id === history.from)
        return {
            id: history.id,
            eventType: history['@type'],
            timestamp: history.date.getTime() ?? 0,
            price: {
                quantity: '1',
                price: history.price,
                asset: {
                    id: fromInfo?.id,
                    decimals: 0,
                    image_url: fromInfo?.image,
                    image_original_url: '',
                    image_preview_url: '',
                    asset_contract: {
                        symbol: fromInfo?.type,
                    },
                    permalink: '',
                },
            },
            accountPair: {
                from: {
                    username: fromInfo?.name,
                    address: fromInfo?.id,
                    imageUrl: fromInfo?.image,
                    link: '',
                },
                to: {
                    username: ownerInfo?.name,
                    address: ownerInfo?.id,
                    imageUrl: ownerInfo?.image,
                    link: '',
                },
            },
        } as NFTHistory
    })
}

//#region new code

function createERC721TokenAsset(
    tokenAddress: string,
    tokenId: string,
    asset?: RaribleNFTItemMapResponse,
): ERC721TokenDetailed {
    return {
        contractDetailed: {
            type: EthereumTokenType.ERC721,
            chainId: ChainId.Mainnet,
            address: tokenAddress,
            name: asset?.meta.name ?? '',
            symbol: '',
        },
        info: {
            name: asset?.meta.name ?? '',
            description: asset?.meta.description ?? '',
            image: asset?.meta.image.url.ORIGINAL ?? asset?.meta.image.url.PREVIEW ?? '',
            owner: asset?.owners[0],
        },
        tokenId: tokenId,
    }
}

function createNFTAsset(asset: RaribleNFTItemMapResponse, chainId: ChainId) {
    const owner = first(asset?.owners)
    const creator = first(asset?.creators)
    return {
        is_verified: false,
        is_auction: false,
        image_url: asset?.meta.image.url.PREVIEW,
        asset_contract: null,
        owner: owner
            ? {
                  address: owner,
                  profile_img_url: '',
                  user: { username: owner },
                  link: '',
              }
            : null,
        creator: creator
            ? {
                  address: creator.account,
                  profile_img_url: '',
                  user: { username: creator.account },
                  link: '',
              }
            : null,
        traits: asset?.meta.attributes.map(({ key, value }) => ({ trait_type: key, value })),
        description: asset?.meta.description ?? '',
        name: asset?.meta.name ?? 'Unknown',
        collection_name: '',
        animation_url: asset.meta.animation?.url.PREVIEW,
        current_price: 0,
        current_symbol: 'ETH',
        end_time: null,
        order_payment_tokens: [] as FungibleTokenDetailed[],
        offer_payment_tokens: [] as FungibleTokenDetailed[],

        slug: '',
        response_: asset,
    } as NFTAsset
}

async function _getAsset(address: string, tokenId: string) {
    return fetchFromRarible<RaribleNFTItemMapResponse>(
        RaribleMainnetAPI,
        `/ethereum/nft/items/${address}:${tokenId}`,
        {},
    )
}

export async function getAsset(address: string, tokenId: string, chainId: ChainId) {
    const asset = await _getAsset(address, tokenId)
    if (!asset) return

    return createNFTAsset(asset, chainId)
}

export async function getNFT(tokenAddress: string, tokenId: string) {
    const asset = await _getAsset(tokenAddress, tokenId)
    return createERC721TokenAsset(tokenAddress, tokenId, asset)
}

export async function getNFTs(from: string, chainId: ChainId) {
    const params = new URLSearchParams()

    params.append('owner', from)
    const asset = await fetchFromRarible<{
        total: number
        continuation: string
        items: RaribleNFTItemMapResponse[]
    }>(RaribleMainnetAPI, `/ethereum/nft/items/byOwner?${params.toString()}`, {})
    if (!asset) return [] as ERC721TokenDetailed[]

    return asset.items.map((asset) => createERC721TokenAsset(asset.contract, asset.tokenId, asset))
}

export async function getContractBalance(from: string, contract_address: string, chainId: ChainId) {
    /*
    const balanceResponse = await fetchFromRarible<{
        contract: string
        owner: string
        balance: string
        decimalBalance: string
    }>(RaribleMainnetURL, `/ethereum/erc20/balances/${contract_address}/${from}`, {})

    return formatBalance(
        new BigNumber(balanceResponse.balance),
        new BigNumber(balanceResponse.decimalBalance).toNumber(),
    )
    */
    const assets = await getNFTs(from, chainId)
    return assets.filter((asset) => isSameAddress(asset.contractDetailed.address, contract_address)).length
}

export async function getContract(from: string, contract_address: string, chainId: ChainId) {
    return
}

export async function getNFTsPaged(from: string, opts: { chainId: ChainId; page?: number; size?: number }) {
    const params = new URLSearchParams()

    params.append('owner', from)
    params.append('size', (opts.size ?? '0').toString())
    const asset = await fetchFromRarible<{
        total: number
        continuation: string
        items: RaribleNFTItemMapResponse[]
    }>(RaribleMainnetAPI, `/ethereum/nft/items/byOwner?${params.toString()}`, {})
    if (!asset) return [] as ERC721TokenDetailed[]

    return asset.items.map((asset) => createERC721TokenAsset(asset.contract, asset.tokenId, asset))
}

//#endregion
