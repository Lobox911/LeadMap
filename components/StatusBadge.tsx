interface Props {
  hasWebsite: boolean
  className?: string
}

export default function StatusBadge({ hasWebsite, className = '' }: Props) {
  if (!hasWebsite) {
    return (
      <span className={'badge-no-website ' + className}>
        No Website
      </span>
    )
  }
  return (
    <span className={'badge-verified ' + className}>
      Verified Website
    </span>
  )
}