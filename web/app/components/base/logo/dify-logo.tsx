'use client'
import type { FC } from 'react'
import useTheme from '@/hooks/use-theme'
import { BRAND_LOGO_URL, BRAND_NAME } from '@/config'
import { cn } from '@/utils/classnames'
import { basePath } from '@/utils/var'

export type LogoStyle = 'default' | 'monochromeWhite'

export const logoPathMap: Record<LogoStyle, string> = {
  default: '/logo/logo.svg',
  monochromeWhite: '/logo/logo-monochrome-white.svg',
}

export type LogoSize = 'large' | 'medium' | 'small'

export const logoSizeMap: Record<LogoSize, string> = {
  large: 'w-16 h-7',
  medium: 'w-12 h-[22px]',
  small: 'w-9 h-4',
}

type DifyLogoProps = {
  style?: LogoStyle
  size?: LogoSize
  className?: string
}

const DifyLogo: FC<DifyLogoProps> = ({
  style = 'default',
  size = 'medium',
  className,
}) => {
  const { theme } = useTheme()
  const themedStyle = (theme === 'dark' && style === 'default') ? 'monochromeWhite' : style
  const brandLogoPath = BRAND_LOGO_URL.startsWith('http') ? BRAND_LOGO_URL : `${basePath}${BRAND_LOGO_URL}`

  return (
    <img
      src={brandLogoPath || `${basePath}${logoPathMap[themedStyle]}`}
      className={cn('block object-contain', logoSizeMap[size], className)}
      alt={`${BRAND_NAME} logo`}
    />
  )
}

export default DifyLogo
