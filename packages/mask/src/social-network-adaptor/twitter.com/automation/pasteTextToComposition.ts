import { delay } from '../../../utils/utils'
import { inputText, pasteText } from '@masknet/injected-script'
import { postEditorDraftContentSelector, newPostButtonSelector } from '../utils/selector'
import type { SocialNetworkUI } from '../../../social-network'
import { getEditorContent, hasFocus, isCompose, hasEditor } from '../utils/postBox'
import { untilElementAvailable } from '../../../utils/dom'
import { isMobileTwitter } from '../utils/isMobile'
import { MaskMessages } from '../../../utils/messages'

/**
 * Wait for up to 5000 ms
 * If not complete, let user do it.
 */
export const pasteTextToCompositionTwitter: SocialNetworkUI.AutomationCapabilities.NativeCompositionDialog['appendText'] =
    (text, opt) => {
        const interval = 500
        const timeout = 5000
        const worker = async function (abort: AbortController) {
            const checkSignal = () => {
                if (abort.signal.aborted) throw new Error('Aborted')
            }
            if (!isCompose() && !hasEditor()) {
                // open tweet window
                await untilElementAvailable(newPostButtonSelector())
                newPostButtonSelector().evaluate()!.click()
                checkSignal()
            }

            // get focus
            const i = postEditorDraftContentSelector()
            await untilElementAvailable(i)
            checkSignal()
            while (!hasFocus(i)) {
                i.evaluate()!.focus()
                checkSignal()
                await delay(interval)
            }
            // paste
            isMobileTwitter ? inputText(text) : pasteText(text)
            await delay(interval)
            if (!getEditorContent().replace(/\n/g, '').includes(text.replace(/\n/g, ''))) {
                fail(new Error('Unable to paste text automatically'))
            }
        }

        const fail = (e: Error) => {
            if (opt?.recover) MaskMessages.events.autoPasteFailed.sendToLocal({ text })
            throw e
        }

        const abortCtr = new AbortController()
        setTimeout(() => {
            abortCtr.abort()
        }, timeout)
        worker(abortCtr).then(undefined, (error) => fail(error))
    }
