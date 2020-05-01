import React from 'react'
import Guide from '../Guide'
import Error from '../Error'
import Loader from '../Loader'
import Markdown from '../Markdown'
import guides from '../../data/guides'
import useFetch from '../../hooks/useFetch'
import './index.css'

export default React.memo(function GuideComplete(props) {
  const guide = guides.find(guide => guide.id === 'COMPLETE_GUIDE')
  const { data: content, error, loading } = useFetch(guide.path, {
    format: 'TEXT',
  })

  return (
    <Guide {...guide} className='GuideComplete'>
      {error ? (
        <Error noTitle error='Error loading guide.' />
      ) : loading ? (
        <Loader />
      ) : (
        <Markdown source={content} />
      )}
    </Guide>
  )
})
