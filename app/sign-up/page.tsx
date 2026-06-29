import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#fcf8fa', padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1b1b1d', marginBottom: 8 }}>WebsiteGap</h1>
          <p style={{ fontSize: 14, color: '#45464d' }}>Create your free account</p>
        </div>
        <SignUp
          appearance={{
            elements: {
              rootBox: { width: '100%' },
              card: {
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                border: '1px solid #c6c6cd',
                borderRadius: 16,
              },
              formButtonPrimary: {
                background: '#006591',
                fontSize: 14,
                '&:hover': { background: '#00547a' },
              },
              footerActionLink: { color: '#006591' },
            },
          }}
        />
      </div>
    </div>
  )
}