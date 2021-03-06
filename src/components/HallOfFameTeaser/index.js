import React from 'react'
import { WEEKLY_CARD_CONTEST } from '../../constants/misc'
import Teaser from '../Teaser'
import getRawCardData from '../../helpers/getRawCardData'
import serialisation from '../../helpers/serialisation'

const getCardData = id => {
  const data = serialisation.card.deserialise(id)
  data.image = getRawCardData(data.imageCardId).image || data.imageURL
  data.strength = data.strength.values[0]
  data.mana = data.mana.values[0]
  data.ability = data.ability.values[0]
  data.level = 1
  return data
}

export default React.memo(function CardContestEntry(props) {
  const cardData = getCardData(props.winner.id)

  return (
    <Teaser
      card={cardData}
      title={'Card by ' + props.winner.author}
      meta={`Week #${WEEKLY_CARD_CONTEST.length - props.index} — ${props.name}`}
      to={`/card/${props.winner.id}`}
      excerpt={
        <>
          <strong className='Highlight'>Ability:</strong> {cardData.ability}
        </>
      }
    />
  )
})
