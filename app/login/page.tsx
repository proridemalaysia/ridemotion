import { login } from './actions'

export default function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <div style={{ 
      display: 'flex', justifyContent: 'center', alignItems: 'center', 
      minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'sans-serif' 
    }}>
      <div style={{ 
        background: 'white', padding: '40px', borderRadius: '24px', 
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', width: '100%', maxWidth: '380px' 
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ fontWeight: 900, fontSize: '26px', color: '#111827', margin: 0 }}>PARTSHUB</h2>
          <p style={{ color: '#6b7280', fontSize: '12px', fontWeight: 'bold', marginTop: '5px' }}>SERVER-SIDE SECURE LOGIN</p>
        </div>

        {searchParams.error && (
          <div style={{ 
            backgroundColor: '#fef2f2', color: '#b91c1c', padding: '12px', 
            borderRadius: '12px', fontSize: '12px', marginBottom: '20px', textAlign: 'center', fontWeight: 'bold' 
          }}>
            {searchParams.error}
          </div>
        )}

        <form action={login} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '10px', fontWeight: 'black', color: '#9ca3af', textTransform: 'uppercase' }}>Email Address</label>
            <input 
              name="email" type="email" required 
              style={{ padding: '14px', borderRadius: '12px', border: '1px solid #e5e7eb', outline: 'none', fontSize: '14px' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '10px', fontWeight: 'black', color: '#9ca3af', textTransform: 'uppercase' }}>Password</label>
            <input 
              name="password" type="password" required 
              style={{ padding: '14px', borderRadius: '12px', border: '1px solid #e5e7eb', outline: 'none', fontSize: '14px' }}
            />
          </div>

          <button 
            type="submit" 
            style={{ 
              marginTop: '10px', padding: '16px', borderRadius: '12px', border: 'none', 
              backgroundColor: '#111827', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' 
            }}
          >
            SIGN IN TO ERP
          </button>
        </form>

        <p style={{ marginTop: '30px', textAlign: 'center', fontSize: '10px', color: '#9ca3af', fontWeight: 'bold' }}>
          JS BYPASS ACTIVE • V1.0.2
        </p>
      </div>
    </div>
  )
}