import { useEffect, useState } from "react"

export function useCurrentUser() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)

  // useEffect(() => {
  //   fetch("/api/v1/me/", { credentials: "include" })
  //     .then(res => res.json())
  //     .then(data => {
  //       setUser(data.result)
  //       setLoading(false)
  //     })
  //     .catch(() => {
  //       setUser(null)
  //       setLoading(false)
  //     })
  // }, [])
  
  return { user, loading }
}