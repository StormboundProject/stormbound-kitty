import React from 'react'
import Column from '../Column'
import CTA from '../CTA'
import Row from '../Row'
import { STATUSES } from '../../constants/tracker'
import './index.css'

const TrackerActions = React.memo(props => {
  if (!props.activeCard) return null

  return (
    <div className='TrackerActions'>
      <Row>
        <Column>
          <CTA
            type='button'
            onClick={props.cycleCard}
            disabled={
              props.status !== STATUSES.PLAYING ||
              !props.activeCard ||
              !!props.cycledCard
            }
          >
            <u>C</u>ycle card
          </CTA>
        </Column>
        <Column style={{ alignItems: 'flex-end' }}>
          <CTA
            type='button'
            onClick={props.playCard}
            disabled={
              props.status !== STATUSES.PLAYING ||
              !props.activeCard ||
              !props.canCardBePlayed(props.activeCard)
            }
          >
            <u>P</u>lay card
          </CTA>
        </Column>
      </Row>
    </div>
  )
})

export default TrackerActions