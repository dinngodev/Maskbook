import { CurrencyType, Pagination, TokenType } from '@masknet/plugin-infra'
import { ChainId } from '@masknet/web3-shared-flow'

export function getFungibleAssets(address: string, providerType: string, networkType: string, pagination?: Pagination) {
    return Promise.resolve([
        {
            id: '0x1654653399040a61',
            chainId: ChainId.Mainnet,
            balance: '3042328822',
            price: {
                [CurrencyType.USD]: '42.64',
            },
            value: {
                [CurrencyType.USD]: '42.62',
            },
            logoURI: 'https://swap.blocto.app/static/media/flow-logo.7d05ec26.svg',
            token: {
                id: '0x1654653399040a61',
                chainId: ChainId.Mainnet,
                type: TokenType.Fungible,
                name: 'Flow',
                symbol: 'FLOW',
                decimals: 8,
                address: '0x1654653399040a61',
            },
        },
        {
            id: '0x3c5959b568896393',
            chainId: ChainId.Mainnet,
            balance: '0',
            price: {
                [CurrencyType.USD]: '42.64',
            },
            value: {
                [CurrencyType.USD]: '0',
            },
            logoURI:
                'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGYAAABkCAYAAAB0F0VpAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAaGVYSWZNTQAqAAAACAAEAQYAAwAAAAEAAgAAARIAAwAAAAEAAQAAASgAAwAAAAEAAgAAh2kABAAAAAEAAAA+AAAAAAADoAEAAwAAAAEAAQAAoAIABAAAAAEAAABmoAMABAAAAAEAAABkAAAAAHl4y70AAALkaVRYdFhNTDpjb20uYWRvYmUueG1wAAAAAAA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJYTVAgQ29yZSA2LjAuMCI+CiAgIDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+CiAgICAgIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiCiAgICAgICAgICAgIHhtbG5zOnRpZmY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vdGlmZi8xLjAvIgogICAgICAgICAgICB4bWxuczpleGlmPSJodHRwOi8vbnMuYWRvYmUuY29tL2V4aWYvMS4wLyI+CiAgICAgICAgIDx0aWZmOkNvbXByZXNzaW9uPjE8L3RpZmY6Q29tcHJlc3Npb24+CiAgICAgICAgIDx0aWZmOlJlc29sdXRpb25Vbml0PjI8L3RpZmY6UmVzb2x1dGlvblVuaXQ+CiAgICAgICAgIDx0aWZmOk9yaWVudGF0aW9uPjE8L3RpZmY6T3JpZW50YXRpb24+CiAgICAgICAgIDx0aWZmOlBob3RvbWV0cmljSW50ZXJwcmV0YXRpb24+MjwvdGlmZjpQaG90b21ldHJpY0ludGVycHJldGF0aW9uPgogICAgICAgICA8ZXhpZjpQaXhlbFhEaW1lbnNpb24+MTAyPC9leGlmOlBpeGVsWERpbWVuc2lvbj4KICAgICAgICAgPGV4aWY6Q29sb3JTcGFjZT4xPC9leGlmOkNvbG9yU3BhY2U+CiAgICAgICAgIDxleGlmOlBpeGVsWURpbWVuc2lvbj4xMDA8L2V4aWY6UGl4ZWxZRGltZW5z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',
            token: {
                id: '0x3c5959b568896393',
                chainId: ChainId.Mainnet,
                type: TokenType.Fungible,
                name: 'Flow USD',
                symbol: 'FUSD',
                decimals: 8,
                address: '0x3c5959b568896393',
            },
        },
        {
            id: '0xcfdd90d4a00f7b5b',
            chainId: ChainId.Mainnet,
            balance: '0',
            price: {
                [CurrencyType.USD]: '42.64',
            },
            value: {
                [CurrencyType.USD]: '0',
            },
            logoURI:
                'data:image/png;base64,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dElkPgogICAgIDxBdHRyaWI6RmJJZD41MjUyNjU5MTQxNzk1ODA8L0F0dHJpYjpGYklkPgogICAgIDxBdHRyaWI6VG91Y2hUeXBlPjI8L0F0dHJpYjpUb3VjaFR5cGU+CiAgICA8L3JkZjpsaT4KICAgPC9yZGY6U2VxPgogIDwvQXR0cmliOkFkcz4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PScnCiAgeG1sbnM6ZGM9J2h0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvJz4KICA8ZGM6dGl0bGU+CiAgIDxyZGY6QWx0PgogICAgPHJkZjpsaSB4bWw6bGFuZz0neC1kZWZhdWx0Jz7mnKrlkb3lkI0g55qE6KSH5pysPC9yZGY6bGk+CiAgIDwvcmRmOkFsdD4KICA8L2RjOnRpdGxlPgogPC9yZGY6RGVzY3JpcHRpb24+CgogPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9JycKICB4bWxuczpwZGY9J2h0dHA6Ly9ucy5hZG9iZS5jb20vcGRmLzEuMy8nPgogIDxwZGY6QXV0aG9yPkhzdWFuIExlZTwvcGRmOkF1dGhvcj4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PScnCiAgeG1sbnM6eG1wPSdodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvJz4KICA8eG1wOkNyZWF0b3JUb29sPkNhbnZhPC94bXA6Q3JlYXRvclRvb2w+CiA8L3JkZjpEZXNjcmlwdGlvbj4KPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KPD94cGFja2V0IGVuZD0ncic/PolbVtwAAAAASUVORK5CYII=',
            token: {
                id: '0xcfdd90d4a00f7b5b',
                chainId: ChainId.Mainnet,
                type: TokenType.Fungible,
                name: 'USD Tether',
                symbol: 'USDT',
                decimals: 8,
                address: '0xcfdd90d4a00f7b5b',
            },
        },
    ])
}
