import React from 'react'

const useFetch = path => {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState(false)
  const [data, setData] = React.useState(undefined)

  React.useEffect(() => {
    setLoading(true)
    fetch(path)
      .then(response => response.json())
      .then(data => {
        setData(data)
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [path])

  return { loading, error, data }
}

export default useFetch
