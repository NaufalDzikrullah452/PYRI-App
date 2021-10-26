/** @jsx jsx */
import { css, jsx } from '@emotion/react'
import type { BaseWindow } from 'web.init/src/window'
import { Icon, Label } from '@fluentui/react'
import { useRef, useEffect } from 'react'
import { useRender } from 'web.utils/src/useRender'

type IMenuSingle = { title: string; url?: string; children: IMenuSingle[] }

declare const window: BaseWindow

type IMenuMeta = {
  active: number[]
}

export const Menu = ({
  data,
  className,
}: {
  data: IMenuSingle[]
  className?: string
}) => {
  const _ = useRef({
    active: [],
  } as IMenuMeta)
  const meta = _.current

  return (
    <div
      className={`${
        className || ''
      } relative self-stretch flex flex-1 overflow-auto`}
    >
      <div className="absolute inset-0 menu-container">
        <MenuTree
          menus={data}
          meta={meta}
          level={0}
          isParentActive={true}
          activateParent={() => {}}
        />
      </div>
    </div>
  )
}

export const MenuTree = ({
  menus,
  meta,
  parent,
  level,
  isParentActive,
  activateParent,
}: {
  level: number
  menus: IMenuSingle[]
  meta: IMenuMeta
  parent?: IMenuSingle
  isParentActive: boolean
  activateParent: () => void
}) => {
  const render = useRender()

  return (
    <div className={`menu-tree flex flex-col items-stretch`}>
      {menus.map((e, idx) => {
        return (
          <MenuSingle
            key={idx}
            idx={idx}
            menu={e}
            meta={meta}
            parent={parent}
            level={level}
            isParentActive={isParentActive}
            activateParent={() => {
              activateParent()
              meta.active.push(idx)
              render()
            }}
          />
        )
      })}
    </div>
  )
}

export const MobileText = (props) => {
  return <div {...props} />
}

export const MenuSingle = ({
  menu,
  idx,
  meta,
  parent,
  isParentActive,
  activateParent,
  level,
}: {
  idx: number
  level: number
  menu: IMenuSingle
  meta: IMenuMeta
  isParentActive: boolean
  parent?: IMenuSingle
  activateParent: () => void
}) => {
  const _ = useRef({
    collapsed: true,
  })
  const internal = _.current
  const current = internal
  const Text = window.platform === 'web' ? Label : MobileText
  const render = useRender()

  useEffect(() => {
    if (menu.url && location.pathname === menu.url) {
      activateParent()
      meta.active.push(idx || 0)
      render()
    }
  }, [])
  useEffect(() => {
    if (meta.active[level] === idx) {
      internal.collapsed = false
      render()
    }
  }, [isParentActive])

  let isMenuActive =
    meta.active.length >= level && meta.active[level] === idx && isParentActive

  let icon = isMenuActive ? 'ChevronDownSmall' : 'ChevronRightSmall'

  let color = isMenuActive ? 'red' : 'grey'

  return (
    <div className={`flex my-1`}>
      {menu.children && (
        <Icon iconName={icon} style={{ color: color, paddingRight: 5 }} />
      )}
      <div
        className={`menu-item flex flex-col cursor-pointer ${
          isMenuActive ? 'active' : ''
        } ${current.collapsed ? 'collapsed' : ''}`}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          if (menu.children) {
            current.collapsed = !current.collapsed
            render()
          } else if (menu.url) {
            meta.active = []
            activateParent()
            meta.active.push(idx || 0)
            render()
            window.navigate(menu.url)
          }
        }}
      >
        <div className={'flex flex-row'}>
          {isMenuActive && !menu.children && (
            <div className={'border-l-2 border-red-500 mr-3'}></div>
          )}
          <Text
            className="menu-title cursor-pointer"
            style={{ color: color }}
            css={css`
              margin: 0px;
              padding: 0px;
            `}
          >
            {menu.title}
          </Text>
        </div>
        <div className={`${!internal.collapsed ? 'flex' : 'hidden'} flex-col`}>
          {menu.children && (
            <MenuTree
              menus={menu.children}
              meta={meta}
              parent={menu}
              level={level + 1}
              isParentActive={meta.active[level] === idx}
              activateParent={() => {
                meta.active.push(idx)
                render()
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default Menu
