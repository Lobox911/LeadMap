import { Confidence } from '@/types'

interface Props {
  hasWebsite: boolean
  confidence?: Confidence
  className?: string
}

export default function StatusBadge({ hasWebsite, confidence = 'confirmed', className = '' }: Props) {
  if (hasWebsite) {
    return (
      <span className={'badge-verified ' + className} title={confidence === 'likely' ? 'Found via live domain match' : 'Confirmed website'}>
        {confidence === 'likely' ? 'Has Website' : 'Verified Website'}
      </span>
    )
  }

  if (confidence === 'pending') {
    return (
      <span className={'badge-checking ' + className}>
        Checking…
      </span>
    )
  }

  if (confidence === 'unconfirmed') {
    return (
      <span className={'badge-unconfirmed ' + className} title="Couldn't be confirmed yet - not the same as 'no website'">
        Unconfirmed
      </span>
    )
  }

  return (
    <span className={'badge-no-website ' + className}>
      No Website
    </span>
  )
}
