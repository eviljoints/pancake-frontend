import { useTranslation } from '@pancakeswap/localization'
import { AnimatePresence, Box, ChevronDownIcon, ChevronUpIcon, CloseIcon, Flex, Row, Text } from '@pancakeswap/uikit'
import { PushClientTypes } from '@walletconnect/push-client'
import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTheme } from 'styled-components'
import {
  ContentsContainer,
  Description,
  ExpandButton,
  StyledLink,
  StyledNotificationWrapper,
} from 'views/Notifications/styles'
import { formatTime } from 'views/Notifications/utils/date'
import FlexRow from 'views/Predictions/components/FlexRow'

interface INotificationprops {
  title: string
  description: string
  id: number
  date: number
  removeNotification: (id: number) => Promise<void>
  url?: string | undefined
}

interface INotificationContainerProps {
  notifications: PushClientTypes.PushMessageRecord[]
  sortOptionsType: string
  removeNotification: (id: number) => Promise<void>
}

const NotificationItem = ({ title, description, id, date, url, removeNotification }: INotificationprops) => {
  const [isHovered, setIsHovered] = useState(false)
  const [show, setShow] = useState<boolean>(false)
  const [elementHeight, setElementHeight] = useState<number>(0)
  const [isClosing, setIsClosing] = useState<boolean>(false)
  const formattedDate = formatTime(Math.floor(date / 1000).toString())
  const containerRef = useRef(null)
  const contentRef = useRef<HTMLElement>(null)
  const theme = useTheme()
  const { t } = useTranslation()

  const deleteNotification = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      e.stopPropagation()
      setIsClosing(true)
      setTimeout(() => {
        removeNotification(id).then(() => setIsClosing(false))
      }, 300)
    },
    [removeNotification, id],
  )

  const handleHover = useCallback(() => setIsHovered(!isHovered), [isHovered])

  const handleExpandClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLDivElement
      if (target.tagName !== 'BUTTON') setShow(!show)
    },
    [show],
  )

  useEffect(() => {
    if (contentRef.current) setElementHeight(contentRef.current.scrollHeight)
  }, [])

  return (
    <StyledNotificationWrapper
      transition={{ duration: 0.05 }}
      whileHover={{ scale: 1.01 }}
      isclosing={isClosing}
      ref={containerRef}
      onClick={handleExpandClick}
    >
      <AnimatePresence>
        <ContentsContainer
          transition={{ duration: 0.3 }}
          style={{
            backgroundColor: isHovered ? 'transparent' : theme.isDark ? '#372F46' : 'white',
            transition: 'background-color 0.15s ease',
          }}
          onMouseEnter={handleHover}
          onMouseLeave={handleHover}
        >
          <Box marginRight="15px" display="flex" minWidth="40px">
            <Image src="/logo.png" alt="Notification Image" height={40} width={40} />
          </Box>
          <Flex flexDirection="column">
            <Flex justifyContent="space-between">
              <Text fontWeight="bold">{title}</Text>
              <Box paddingX="5px" height="fit-content" onClick={deleteNotification}>
                <CloseIcon cursor="pointer" />
              </Box>
            </Flex>
            <Description
              ref={contentRef}
              transition={{ duration: 0.33, ease: 'easeInOut' }}
              initial={{ maxHeight: 32 }}
              animate={{ maxHeight: show ? elementHeight : 32 }}
            >
              {description}
              <StyledLink hidden={Boolean(url)} href={url} target="_blank" rel="noreferrer noopener">
                {t('View Link')}
              </StyledLink>
            </Description>
            <BottomRow show={show} formattedDate={formattedDate} />
          </Flex>
        </ContentsContainer>
      </AnimatePresence>
    </StyledNotificationWrapper>
  )
}

const BottomRow = ({ show, formattedDate }: { show: boolean; formattedDate: string }) => {
  const { t } = useTranslation()
  return (
    <Row justifyContent="space-between">
      <FlexRow>
        <ExpandButton color="secondary" marginY="5px" fontSize="15px">
          {show ? t('Show Less') : t('Show More')}
        </ExpandButton>
        {show ? <ChevronUpIcon color="secondary" /> : <ChevronDownIcon color="secondary" />}
      </FlexRow>
      <Text fontSize="15px" marginRight="8px">
        {formattedDate}
      </Text>
    </Row>
  )
}

const NotificationContainer = ({ notifications, sortOptionsType, removeNotification }: INotificationContainerProps) => {
  return (
    <Box>
      {notifications
        .sort((a: PushClientTypes.PushMessageRecord, b: PushClientTypes.PushMessageRecord) => {
          if (sortOptionsType === 'Latest') return b.publishedAt - a.publishedAt
          return a.publishedAt - b.publishedAt
        })
        .map((notification: PushClientTypes.PushMessageRecord) => {
          return (
            <NotificationItem
              key={notification.id}
              title={notification.message.title}
              description={notification.message.body}
              id={notification.id}
              date={notification.publishedAt}
              url={notification.message.url}
              removeNotification={removeNotification}
            />
          )
        })}
    </Box>
  )
}

export default NotificationContainer
