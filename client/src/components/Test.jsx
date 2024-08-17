// http://localhost:3500/api/users/register
import React, { useEffect } from 'react';

const TestProxy = () => {
  useEffect(() => {
    async function testProxy() {
      try {
        const response = await fetch('/api/users/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username: 'testuser', password: 'testpassword' }),
        });
        const data = await response.json();
        console.log('Proxy test response:', data);
      } catch (err) {
        console.error('Proxy test error:', err);
      }
    }

    testProxy();
  }, []);

  return <div>Testing Proxy...</div>;
};

export default TestProxy;
