import { useEffect, useState } from 'react'
import { isCurrentUserAdmin } from '../services/adminService'

export function useAdminStatus() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(true)

  useEffect(() => {
    let isMounted = true

    isCurrentUserAdmin()
      .then((result) => {
        if (isMounted) {
          setIsAdmin(result)
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsAdmin(false)
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingAdmin(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  return { isAdmin, isLoadingAdmin }
}
