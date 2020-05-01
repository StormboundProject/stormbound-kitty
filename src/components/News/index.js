import React from 'react'
import { Link } from 'react-router-dom'
import Column from '../Column'
import CTA from '../CTA'
import Error from '../Error'
import Loader from '../Loader'
import Row from '../Row'
import chunk from '../../helpers/chunk'
import useFetch from '../../hooks/useFetch'
import './index.css'

const MAX_NEWS = 7

export default React.memo(function News(props) {
  const { data: news = [], error, loading } = useFetch('data/news.json')
  const pages = chunk(news, MAX_NEWS)
  const [activePage, setActivePage] = React.useState(0)
  const loadPrev = () => setActivePage(page => page + 1)
  const loadNext = () => setActivePage(page => page - 1)

  if (error) {
    return <Error noImage noTitle error={`Error fetching the news.`} />
  }

  if (loading) {
    return <Loader />
  }

  return (
    <>
      <ul className='News'>
        {(pages[activePage] || []).map((news, index) => (
          <li className='News__item' key={index}>
            {news.link ? (
              <Link to={news.link}>
                <strong className='Highlight'>{news.intro}:</strong>
              </Link>
            ) : (
              <strong className='Highlight'>{news.intro}:</strong>
            )}{' '}
            {news.description}
          </li>
        ))}
      </ul>
      <Row desktopOnly>
        <Column align='center'>
          <CTA type='button' onClick={loadNext} disabled={activePage === 0}>
            Recent news
          </CTA>
        </Column>
        <Column align='center'>
          <CTA
            type='button'
            onClick={loadPrev}
            disabled={activePage === pages.length - 1}
          >
            Older news
          </CTA>
        </Column>
      </Row>
    </>
  )
})
