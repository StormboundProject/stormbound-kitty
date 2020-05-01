import React from 'react'
import Error from '../Error'
import Guide from '../Guide'
import Loader from '../Loader'
import Markdown from '../Markdown'
import guides from '../../constants/guides'
import useFetch from '../../hooks/useFetch'

export default React.memo(function GuidePirate(props) {
  const guide = guides.find(guide => guide.id === 'PIRATE_GUIDE')
  const { data: content, error, loading } = useFetch(guide.path, {
    format: 'TEXT',
  })

  return (
    <Guide {...guide}>
      {error ? (
        <Error error='Error loading guide.' />
      ) : loading ? (
        <Loader />
      ) : (
        <Markdown source={content} />
      )}
    </Guide>
  )
})
