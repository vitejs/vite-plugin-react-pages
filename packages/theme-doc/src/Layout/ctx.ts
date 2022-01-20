import { createContext } from 'react'
import type React from 'react'

export interface LayoutContextValue {
  screenWidth: Record<string, boolean | undefined>
  isSlideSiderOpen: boolean
  setIsSlideSiderOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export const LayoutContext = createContext<LayoutContextValue>({
  screenWidth: {},
  isSlideSiderOpen: false,
  setIsSlideSiderOpen: () => {},
})
