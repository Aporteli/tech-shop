const BASE_URL = 'http://localhost:5001/api';

export async function handleRegister(formData) {
  try {
    const endpoint = formData.method === 'email' ? '/register/email' : '/register/phone';

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'დაფიქსირდა შეცდომა');
    }

    return { success: true, message: data.message, data, user: data.user };
  } catch (err) {
    return { success: false, error: err.message || 'დაფიქსირდა შეცდომა' };
  }
}

export async function handleSignIn(formData) {
  try {
    const endpoint = formData.method === 'email' ? '/signin/email' : '/signin/phone';

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'დაფიქსირდა შეცდომა');
    }

    return { success: true, message: data.message, data, user: data.user };
  } catch (err) {
    return { success: false, error: err.message || 'დაფიქსირდა შეცდომა' };
  }
}

export const handleGoogleAuth = async googleAccessToken => {
  try {
    const response = await fetch(`${BASE_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ googleToken: googleAccessToken })
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, data: { token: data.token }, user: data.user };
    } else {
      return { success: false, error: data.message };
    }
  } catch (err) {
    return { success: false, error: 'Google ავტორიზაციის შეცდომა' };
  }
};

export async function sendEmailVerificationCode(email) {
  try {
    const response = await fetch(`${BASE_URL}/verification/email-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'დაფიქსირდა შეცდომა');
    }

    return { success: true, message: data.message };
  } catch (err) {
    return { success: false, error: err.message || 'დაფიქსირდა შეცდომა' };
  }
}

export async function verifyEmailCode(email, code) {
  try {
    const response = await fetch(`${BASE_URL}/verification/code-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, code })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'დაფიქსირდა შეცდომა');
    }

    return { success: true, message: data.message, data };
  } catch (err) {
    return { success: false, error: err.message || 'დაფიქსირდა შეცდომა' };
  }
}
