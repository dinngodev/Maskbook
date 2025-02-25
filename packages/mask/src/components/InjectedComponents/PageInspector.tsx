import { useEffect } from 'react'
import { useCustomSnackbar, makeStyles } from '@masknet/theme'
import { activatedSocialNetworkUI } from '../../social-network'
import { isFacebook } from '../../social-network-adaptor/facebook.com/base'
import { Button, Box, Typography } from '@mui/material'
import { createInjectHooksRenderer, useActivatedPluginsSNSAdaptor } from '@masknet/plugin-infra'
import { useMatchXS, MaskMessages, useI18N } from '../../utils'
import { useAutoPasteFailedDialog } from './AutoPasteFailedDialog'

interface StyleProps {
    isfacebook: boolean
}

const useStyles = makeStyles<StyleProps>()((theme, props) => ({
    content: {
        transform: props.isfacebook ? 'translateY(-100px) !important' : 'none',
    },
}))

const PluginRender = createInjectHooksRenderer(useActivatedPluginsSNSAdaptor, (x) => x.GlobalInjection)

export interface PageInspectorProps {}

export function PageInspector(props: PageInspectorProps) {
    const { t } = useI18N()
    const { classes } = useStyles({ isfacebook: isFacebook(activatedSocialNetworkUI) })
    const { showSnackbar, closeSnackbar } = useCustomSnackbar()
    const [autoPasteFailed, JSX] = useAutoPasteFailedDialog()
    const xsMatched = useMatchXS()

    useEffect(
        () =>
            MaskMessages.events.autoPasteFailed.on((data) => {
                const key = data.image ? Math.random() : data.text
                const close = () => {
                    closeSnackbar(key)
                }
                const timeout = setTimeout(close, 15 * 1000 /** 15 seconds */)
                showSnackbar(
                    <>
                        <Typography color="textPrimary">{t('auto_paste_failed_snackbar')}</Typography>
                        <Box display="flex" justifyContent="flex-end" sx={{ marginTop: 0.5 }}>
                            <Button
                                color="inherit"
                                variant="text"
                                onClick={() => [clearTimeout(timeout), close(), autoPasteFailed(data)]}>
                                {t('auto_paste_failed_snackbar_action')}
                            </Button>
                            <Button color="inherit" variant="text" aria-label="Close" onClick={close}>
                                {t('auto_paste_failed_snackbar_action_close')}
                            </Button>
                        </Box>
                    </>,
                    {
                        variant: 'info',
                        preventDuplicate: true,
                        anchorOrigin: xsMatched
                            ? {
                                  vertical: 'bottom',
                                  horizontal: 'center',
                              }
                            : { horizontal: 'left', vertical: 'bottom' },
                        key,
                        action: <></>,
                        classes,
                    },
                )
            }),
        [],
    )
    return (
        <>
            {JSX}
            <PluginRender />
        </>
    )
}
