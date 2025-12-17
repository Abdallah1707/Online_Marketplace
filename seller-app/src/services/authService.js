import apiClient from './api'

export const authService = {
  register: (name, email, password) => {
    return apiClient.post('/auth/register', {
      name,
      email,
      password,
      role: 'seller'
    })
  },

  login: (email, password) => {
    return apiClient.post('/auth/login', {
      email,
      password
    })
  },

  getAllUsers: () => {
    return apiClient.get('/auth/users')
  }
}
